import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { sign } from 'jsonwebtoken';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { EnvironmentService } from 'Environment/environment.service';
import { INTERCOM_SENSITIVE_FIELDS, INTERCOM_ENDPOINTS } from 'Intercom/constants';
import {
  SearchContactInputDto,
  CreateContactInputDto,
  CreateConversationInputDto,
  CreateConversationWithEmailInputDto,
  FindOrCreateContactInputDto,
  GenerateIntercomJWTInputDto,
  MergeLeadIntoUserContactInputDto,
  ContactInfoDto,
  MergeLeadAndUserHasSameEmailInputDto,
  UpdateContactInputDto,
} from 'Intercom/dtos/intercom.dto';
import {
  IIntercomContact, IIntercomConversation, IIntercomSearchResponse,
} from 'Intercom/interfaces/intercom.interface';
import { LoggerService } from 'Logger/Logger.service';

import { IntercomContactRole, IntercomOperators } from './intercom.enum';

@Injectable()
export class IntercomService {
  private readonly intercomBaseUrl: string = CommonConstants.INTERCOM_API_ENDPOINT;

  private readonly loggerService: LoggerService;

  private intercomInstance: AxiosInstance;

  constructor(
    private readonly environmentService: EnvironmentService,
  ) {
    this.intercomInstance = axios.create({
      baseURL: this.intercomBaseUrl,
      headers: this.getIntercomHeaders(),
    });
  }

  private getIntercomHeaders() {
    const apiKey = this.environmentService.getByKey(EnvConstants.INTERCOM_API_KEY);
    return {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  private async postToIntercom<T>(url: string, body: any): Promise<T> {
    try {
      const { data } = await this.intercomInstance.post<T>(url, body);
      return data;
    } catch (error) {
      this.loggerService.error({
        error,
        context: this.putToIntercom.name,
      });
      throw HttpErrorException.InternalServerError('Failed to post to Intercom');
    }
  }

  private async putToIntercom<T>(url: string, body: any): Promise<T> {
    try {
      const { data } = await this.intercomInstance.put<T>(url, body);
      return data;
    } catch (error) {
      this.loggerService.error({
        error,
        context: this.putToIntercom.name,
      });
      throw HttpErrorException.InternalServerError('Failed to put to Intercom');
    }
  }

  async mergeLeadIntoUser({ leadContactId, userContactId }: MergeLeadIntoUserContactInputDto) {
    try {
      const mergedContact = await this.postToIntercom<IIntercomContact>(INTERCOM_ENDPOINTS.MERGE_LEAD_INTO_USER, {
        from: leadContactId,
        into: userContactId,
      });
      return mergedContact;
    } catch (error) {
      this.loggerService.error({
        error,
        context: this.mergeLeadIntoUser.name,
        extraInfo: {
          leadContactId,
          userContactId,
        },
      });
      return null;
    }
  }

  // Note If a contact has recently been created, there is a possibility that it will not yet be available when searching
  // https://developers.intercom.com/docs/references/rest-api/api.intercom.io/contacts/searchcontacts#section/Contact-Creation-Delay
  async searchContactsByEmail({ email }: SearchContactInputDto): Promise<IIntercomContact[] | null> {
    const { data } = await this.postToIntercom<IIntercomSearchResponse>(INTERCOM_ENDPOINTS.SEARCH_CONTACTS, {
      query: {
        operator: 'AND',
        value: [
          {
            field: 'email',
            operator: IntercomOperators.EQUAL,
            value: email,
          },
        ],
      },
    });
    return data.length > 0 ? data : null;
  }

  async createContact(contactInfo: CreateContactInputDto): Promise<IIntercomContact> {
    return this.postToIntercom<IIntercomContact>(INTERCOM_ENDPOINTS.CONTACT, contactInfo);
  }

  async updateContact({ id, name }: UpdateContactInputDto): Promise<IIntercomContact> {
    const contactInfo = { name };
    const endpoint = [INTERCOM_ENDPOINTS.CONTACT, id].join('/');
    return this.putToIntercom<IIntercomContact>(endpoint, contactInfo);
  }

  createConversation({
    body, subject, messageType, contactInfo,
  }: CreateConversationInputDto): Promise<IIntercomConversation> {
    const { id, role: type } = contactInfo;
    return this.postToIntercom<IIntercomConversation>(INTERCOM_ENDPOINTS.CONVERSATION, {
      from: {
        type,
        id,
      },
      subject,
      body,
      ...(messageType && { message_type: messageType }),
    });
  }

  async syncContactInfor({ email, name } : FindOrCreateContactInputDto): Promise<IIntercomContact> {
    const contacts = await this.searchContactsByEmail({ email });

    if (!contacts?.length) {
      return this.createContact({ email, role: IntercomContactRole.LEAD, name });
    }

    const { id, role, name: contactName } = contacts[0];
    const isLeadContact = role === IntercomContactRole.LEAD;
    const shouldUpdateContact = isLeadContact && (!contactName || name && name !== contactName);

    if (shouldUpdateContact) {
      return this.updateContact({ id, name });
    }

    return contacts[0];
  }

  async createConversationWithEmail({
    email, body, subject, messageType, name,
  }: CreateConversationWithEmailInputDto): Promise<IIntercomConversation> {
    const contactInfo = await this.syncContactInfor({ email, name }) as ContactInfoDto;

    return this.createConversation({
      body, subject, messageType, contactInfo,
    });
  }

  async mergeLeadAndUserHasSameEmail({ email }: MergeLeadAndUserHasSameEmailInputDto): Promise<IIntercomContact | null> {
    const { LEAD, USER } = IntercomContactRole;
    const mergeRoles = [LEAD, USER];
    const createdContacts = await this.searchContactsByEmail({ email });
    const shouldFindToMergeContacts = createdContacts && createdContacts.length >= mergeRoles.length;

    if (shouldFindToMergeContacts) {
      const createdUser = createdContacts.find((contact) => contact.role === USER);
      const createdLead = createdContacts.find((contact) => contact.role === LEAD);

      if (!createdUser || !createdLead) {
        return null;
      }
      return this.mergeLeadIntoUser({ leadContactId: createdLead.id, userContactId: createdUser.id });
    }
    return null;
  }

  async generateJwtToken({ email, name, id } : GenerateIntercomJWTInputDto): Promise<string> {
    const { USER_ID, EMAIL, NAME } = INTERCOM_SENSITIVE_FIELDS;

    const payload = {
      [USER_ID]: id,
      [NAME]: name,
      [EMAIL]: email,
    };
    try {
      await this.mergeLeadAndUserHasSameEmail({ email });

      return sign(payload, this.environmentService.getByKey(EnvConstants.INTERCOM_JWT_SECRET), { expiresIn: CommonConstants.INTERCOM_JWT_EXPIRE_IN });
    } catch (error) {
      this.loggerService.error({
        error,
        context: this.generateJwtToken.name,
        extraInfo: payload,
      });
      throw HttpErrorException.BadRequest('Invalid user');
    }
  }
}
