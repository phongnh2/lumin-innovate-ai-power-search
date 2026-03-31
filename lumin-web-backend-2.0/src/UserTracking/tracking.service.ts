/* eslint-disable max-classes-per-file */
import * as hubspot from '@hubspot/api-client';
import {
  FilterGroup,
  FilterOperatorEnum,
  SimplePublicObject,
  SimplePublicObjectBatchInput,
} from '@hubspot/api-client/lib/codegen/crm/companies';
import { HttpStatus, Injectable } from '@nestjs/common';
import { throttle } from 'lodash';
import { v4 } from 'uuid';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';

import { EnvironmentService } from 'Environment/environment.service';
import { HubspotClientProvider } from 'Hubspot/hubspot-client.provider';
import { LogLevel, LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { PinpointService } from 'Pinpoint/pinpoint.service';
import { IActiveContact } from 'UserTracking/interfaces/contact.interface';
import { ContactPool } from 'UserTracking/pool.service';
import { Retry } from 'UserTracking/retry.service';

import { AuthenticationEvent, AuthenticationEventType, TAuthenticationEventAttributes } from './authentication-event';
import {
  SyncAvatarEvent, SyncAvatarEventAttributes, SyncAvatarEventMetrics, SyncAvatarEventType,
} from './sync-avatar-event';

type UpdateContactInput = {
  id: string;
  properties: SimplePublicObjectBatchInput['properties'];
}

type InsertContactInput = {
  email: string;
  properties: SimplePublicObjectBatchInput['properties'];
}

type TPoolData = InsertContactInput[];

type TLogHubspotData = {
  level: LogLevel;
  context: string;
  correlationId?: string;
  inputs?: Array<InsertContactInput | UpdateContactInput>;
  error?: any;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class UserTrackingService {
  private CONTACTS_LIMIT = 10;

  private pool: ContactPool;

  private poolSize: number;

  private hubspotClient: hubspot.Client;

  private _throttleFunc: (...args: unknown[]) => void;

  public static STRIPE_PLAN = {
    FREE_USER: 'lumin_free',
  };

  public static FREE_TRIAL_TYPE_HUBSPOT = {
    BEFORE: 'Payment Before',
  };

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
    private readonly redisService: RedisService,
    private readonly pinpointService: PinpointService,
    private readonly hubspotClientProvider: HubspotClientProvider,
  ) {
    this.hubspotClient = this.hubspotClientProvider.getClient();
    this.poolSize = Number(this.environmentService.getByKey(EnvConstants.HUBSPOT_POOL_SIZE));
    this.pool = new ContactPool(this.poolSize, this.redisService, this.loggerService);
  }

  private throttleResultLog(log: TLogHubspotData) {
    if (!this._throttleFunc) {
      this._throttleFunc = throttle((_log: TLogHubspotData) => this.logHubspotData(_log), 2000, { trailing: true });
    }
    this._throttleFunc(log);
  }

  private logHubspotData({
    level, context, inputs, error, metadata, correlationId,
  }: TLogHubspotData) {
    const { body: resBody, statusCode, request } = error?.response || {};
    const payload = {
      context,
      error: resBody || (error instanceof Error ? error.message : error),
      stack: error?.stack,
      extraInfo: {
        service: 'tracking.service',
        correlationId,
        timestamp: Date.now(),
        inputs,
        statusCode,
        uri: request?.uri,
        ...metadata,
      },
    };
    switch (level) {
      case 'error':
        this.loggerService.error({
          errorCode: ErrorCode.Common.THIRD_PARTY_ERROR,
          ...payload,
        });
        break;
      case 'warn':
        this.loggerService.warn(payload);
        break;
      case 'debug':
        this.loggerService.debug(JSON.stringify(payload), payload);
        break;
      default:
        throw new Error(`Invalid log level: ${level} for logHubspotData function`);
    }
  }

  private async batchUpdateContact(inputs: UpdateContactInput[]): Promise<any> {
    return this.hubspotClient.crm.contacts.batchApi.update({ inputs });
  }

  private async batchCreateContact(contacts: InsertContactInput[]): Promise<any> {
    const batchCreateInput = contacts.map((contact) => ({ properties: { email: contact.email, ...contact.properties } }));
    return this.hubspotClient.crm.contacts.batchApi.create({ inputs: batchCreateInput });
  }

  private async batchReadContactByEmails(emails: string[], properties: string[]): Promise<any[]> {
    const inputs = emails.map((email) => ({ id: email }));
    const response = await this.hubspotClient.crm.contacts.batchApi.read({
      inputs,
      properties,
      idProperty: 'email',
      propertiesWithHistory: [],
    }, false);
    return response.results;
  }

  private async separateContactList(pool: TPoolData, correlationId: string, shouldRetry: boolean = false) {
    const properties = ['id', 'email', 'hs_additional_emails'];
    const contactEmails: string[] = pool.map(({ email }) => email).filter(Boolean);
    let contactList = [];
    if (shouldRetry) {
      contactList = await Retry.Do(() => this.batchReadContactByEmails(contactEmails, properties))
        .catch((error) => {
          this.logHubspotData({
            correlationId,
            level: 'warn',
            context: 'batchReadContact',
            metadata: { properties },
            error,
          });
          throw error;
        });
    } else {
      contactList = await this.batchReadContactByEmails(contactEmails, properties);
    }

    const replaceInputWithContactId: Record<string, any>[] = pool.map((poolData) => {
      const foundContact = contactList.find(
        (contact) => contact.properties.email === poolData.email || contact.properties.hs_additional_emails?.includes(poolData.email),
      );
      if (!foundContact || !foundContact.id) {
        return poolData;
      }
      return { id: foundContact.id, properties: poolData.properties };
    });
    const updateContacts = <UpdateContactInput[]>replaceInputWithContactId.filter((input) => input.id);
    const insertContacts = <InsertContactInput[]>replaceInputWithContactId.filter((input) => !input.id);
    return { updateContacts, insertContacts };
  }

  private async safe_batchCreateContact(
    inputs: InsertContactInput[],
    correlationId: string,
  ): Promise<null | { error?: unknown, updateContacts?: UpdateContactInput[]}> {
    try {
      await this.batchCreateContact(inputs);
      return null;
    } catch (error) {
      const { statusCode } = error?.response || {};
      this.logHubspotData({
        level: 'warn',
        context: 'safe_batchCreateContact',
        correlationId,
        inputs,
        error,
      });
      if (statusCode !== HttpStatus.CONFLICT) {
        return {
          error,
        };
      }
      const { updateContacts } = await this.separateContactList(inputs, correlationId);
      return {
        error,
        updateContacts,
      };
    }
  }

  private async batchUpdateRequest(pool: TPoolData, correlationId: string) {
    const { insertContacts, updateContacts } = await this.separateContactList(pool, correlationId, true);
    let updateList = [...updateContacts];
    let error = null;
    if (insertContacts.length) {
      const batchResult = await this.safe_batchCreateContact(insertContacts, correlationId);
      // If we faced an error after creating new contacts such as:
      // 1. The contact already exists: we will push existed contacts to updateList and throw the error
      // 2. Other errors: we will throw the error
      error = batchResult?.error;
      if (batchResult && batchResult.updateContacts) {
        updateList.push(...batchResult.updateContacts);
        const map = updateList.reduce((acc, cur) => {
          const exists = acc[cur.id];
          acc[cur.id] = !exists ? cur : { ...exists, properties: { ...exists.properties, ...cur.properties } };
          return acc;
        }, {});
        updateList = Object.values(map);
      }
    }
    if (updateList.length) {
      try {
        await this.batchUpdateContact(updateList);
      } catch (e) {
        this.logHubspotData({
          level: 'warn',
          context: 'batchUpdateContact',
          correlationId,
          inputs: updateList,
          error: e,
        });
      }
    }
    const logPayload = {
      level: 'debug' as LogLevel,
      context: 'batchUpdateRequest',
      correlationId,
      metadata: {
        hasError: Boolean(error),
        insertListLength: insertContacts.length,
        updateListLength: updateContacts.length,
      },
    };
    if (error) {
      this.logHubspotData({
        ...logPayload,
        level: 'warn',
      });
      throw error;
    } else {
      this.throttleResultLog(logPayload);
    }
  }

  public async createContact(
    contact: Partial<IActiveContact>,
  ): Promise<SimplePublicObject> {
    try {
      const response = await this.hubspotClient.crm.contacts.basicApi.create({
        properties: contact,
      });
      return response;
    } catch (err) {
      const error = err.response?.body;
      if (error?.category === 'CONFLICT') {
        return null;
      }
      this.logHubspotData({
        level: 'warn',
        context: 'createContact',
        error,
        metadata: { error },
      });
    }
    return null;
  }

  private async getContacts(filterGroups: FilterGroup[], properties: string[]): Promise<SimplePublicObject[]> {
    try {
      const response = await this.hubspotClient.crm.contacts.searchApi.doSearch({
        limit: this.CONTACTS_LIMIT,
        properties,
        filterGroups,
        after: '0',
        sorts: ['firstname'],
      });
      return response.results;
    } catch (error) {
      this.logHubspotData({
        level: 'warn',
        context: 'getContacts',
        error,
        metadata: { error },
      });
    }
    return [];
  }

  public async getContactByEmail(email: string): Promise<SimplePublicObject> {
    const groups = [
      {
        filters: [
          {
            propertyName: 'email',
            operator: 'EQ' as FilterOperatorEnum,
            value: email,
          },
        ],
      },
    ];
    const properties = ['firstname', 'email', 'stripeplan', 'stripeid', 'join_org_purpose'];
    const response = await this.getContacts(groups, properties);
    return response[0];
  }

  private async updateContact(email: string, properties) {
    await this.pool.pushToPool({ email, properties });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.pool.dispatchPoolAction((pool: TPoolData) => {
      const correlationId = v4();
      Retry.Do(() => this.batchUpdateRequest(pool, correlationId)).catch((error) => {
        this.logHubspotData({
          level: 'error',
          context: 'updateContact',
          correlationId,
          inputs: pool,
          error,
        });
      });
    });
  }

  public async updateUserContact(
    email: string,
    properties: Partial<IActiveContact>,
  ): Promise<any> {
    return this.updateContact(email, properties).catch((error) => {
      this.loggerService.warn({
        contactId: email,
        properties,
        context: 'updateUserContact',
        error: error.message,
      });
      return null;
    });
  }

  private async deleteContact(contactId: string): Promise<void> {
    try {
      await this.hubspotClient.crm.contacts.basicApi.archive(contactId);
    } catch (error) {
      this.loggerService.warn({
        context: 'deleteContact',
        contactId,
        error,
      });
    }
    return null;
  }

  public async deleteContactByEmail(email: string): Promise<void> {
    const userContact = await this.getContactByEmail(email);
    if (!userContact || !userContact.id) {
      return null;
    }
    return this.deleteContact(userContact.id);
  }

  public trackAccountCreatedEvent(attributes: TAuthenticationEventAttributes) {
    const trackingEvent = new AuthenticationEvent(attributes, AuthenticationEventType.ACCOUNT_CREATED);
    this.pinpointService.add(trackingEvent);
  }

  public trackAvatarSyncedEvent(attributes: SyncAvatarEventAttributes, metrics: SyncAvatarEventMetrics) {
    const trackingEvent = new SyncAvatarEvent(attributes, SyncAvatarEventType.AVATAR_SYNCED, metrics);
    this.pinpointService.add(trackingEvent);
  }
}
