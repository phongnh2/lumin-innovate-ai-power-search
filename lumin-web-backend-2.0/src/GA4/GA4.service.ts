import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { Utils } from 'Common/utils/Utils';

import { EnvironmentService } from 'Environment/environment.service';
import { LogMessage, LoggerService } from 'Logger/Logger.service';
import { GA4OpenOneDriveCommonAttributes } from 'OpenOneDrive/interfaces/common.interface';

export const MAX_GA4_KEY_LENGTH = 40;
export const MAX_GA4_VALUE_LENGTH = 100;

export const GA4_RESERVED_PREFIX = {
  GOOGLE: 'google_',
};

export const GA4_RESERVED_PREFIX_MAP = {
  [GA4_RESERVED_PREFIX.GOOGLE]: 'gg_',
};

export const ID_PREFIX = 'id_';

export interface IGA4OpenGoogleCommonAttributes {
  userAgent: string;
  anonymousUserId: string;
  ipAddress: string;
  googleUserId: string;
  googleUserIdFromUrl: string;
  grantedScopes: string;
  currentUrl: string;
  referrer: string;
  googleAccessTokenInfo: {
    scopes: string;
    email: string;
    userId: string;
    isExpired: string;
    expireAt: string;
  }
}
@Injectable()
export class GA4Service {
  constructor(
    private readonly httpService: HttpService,
    private readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
  ) { }

  gaMeasurementId = this.environmentService.getByKey(EnvConstants.GA4_MEASUREMENT_ID);

  gaApiSecret = this.environmentService.getByKey(EnvConstants.GA4_API_SECRET);

  config = {
    headers: { 'Content-Type': 'application/json' },
    params: {
      api_secret: this.gaApiSecret,
      measurement_id: this.gaMeasurementId,
    },
  };

  getCommonAttributesForOpenGoogleEvent(payload: LogMessage): IGA4OpenGoogleCommonAttributes {
    const { extraInfo, ...commonAttributes } = payload;
    const {
      userAgent, anonymousUserId, ipAddress,
    } = commonAttributes;
    const {
      scopes, email, isExpired, expireAt, userRemoteId,
    } = extraInfo?.googleAccessTokenInfo || {};
    const {
      referrer, currentURL: currentUrl, googleUserIdFromURL, grantedScopes, googleUserId,
    } = extraInfo;

    return {
      userAgent,
      anonymousUserId,
      ipAddress,
      googleUserId: this.withIDPrefix(googleUserId as string),
      googleUserIdFromUrl: this.withIDPrefix(googleUserIdFromURL as string),
      grantedScopes,
      currentUrl,
      referrer,
      googleAccessTokenInfo: {
        scopes,
        email,
        userId: this.withIDPrefix(userRemoteId as string),
        isExpired,
        expireAt,
      },
    };
  }

  getCommonAttributesForOpenOneDriveEvent(payload: LogMessage): GA4OpenOneDriveCommonAttributes {
    const { extraInfo, ...commonAttributes } = payload;
    const {
      userAgent, anonymousUserId, ipAddress,
    } = commonAttributes;

    const {
      referrer, currentURL: currentUrl, isBusinessDomain,
    } = extraInfo;

    return {
      userAgent,
      anonymousUserId,
      ipAddress,
      currentUrl,
      referrer,
      isBusinessDomain,
    };
  }

  withIDPrefix(value: string): string {
    if (!value) return '';
    return ID_PREFIX.concat(value);
  }

  isReservedKey(key: string): boolean {
    return Object.keys(GA4_RESERVED_PREFIX_MAP).some((reservedKey) => key.startsWith(reservedKey));
  }

  getMappedReservedKey(key: string): string {
    const prefix = Object.keys(GA4_RESERVED_PREFIX_MAP).find((reservedKey) => key.startsWith(reservedKey));
    return key.replace(prefix, GA4_RESERVED_PREFIX_MAP[prefix]);
  }

  mapReservedParamsKey(params: Record<string, any>): Record<string, any> {
    Object.keys(params).forEach((key) => {
      if (this.isReservedKey(key)) {
        const mappedKey = this.getMappedReservedKey(key);
        params[mappedKey] = params[key];
        delete params[key];
      }
    });

    return params;
  }

  standardizeParams(params: Record<string, any>): Record<string, any> {
    return this.mapReservedParamsKey(
      Utils.toSnakeCaseKeys(
        Utils.truncateOjectKeyAndValue(
          Utils.recursiveFlattenObject(params, ''),
          MAX_GA4_KEY_LENGTH,
          MAX_GA4_VALUE_LENGTH,
        ),
      ),
    );
  }

  async send({
    eventName, params, clientId, userId,
  }: {
    eventName: string, params: Record<string, any>, clientId: string, userId: string
  }): Promise<void> {
    const standardParams = this.standardizeParams(params);
    const payload = {
      client_id: clientId,
      user_id: userId,
      events: [{
        name: eventName,
        params: standardParams,
      }],
    };
    const res = await firstValueFrom(this.httpService.post(
      CommonConstants.GA_MEASUREMENT_PROTOCOL_ENDPOINT,
      payload,
      this.config,
    ));
    this.loggerService.info({
      context: `Ga4Event-${eventName}`,
      extraInfo: {
        clientId,
        userId,
        status: res.status,
        statusText: res.statusText,
        standardParams,
      },
    });
  }
}
