import { PutEventsRequest } from '@aws-sdk/client-pinpoint';
import { Injectable } from '@nestjs/common';
import { cloneDeep } from 'lodash';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { UrlSearchParam } from 'Common/constants/UrlSearchParam';

import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService, LogMessage } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { PinpointEvent } from 'Pinpoint/pinpoint-event';
import { PinpointEventQueue } from 'Pinpoint/pinpoint-event-queue.';

@Injectable()
export class PinpointService {
  private _queue: PinpointEventQueue;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
    private readonly redisService: RedisService,
  ) {
    this._queue = this.createQueue();
  }

  private createQueue(): PinpointEventQueue {
    return new PinpointEventQueue({
      config: {
        appVersion: this.environmentService.getByKey('VERSION'),
        flushInterval: +this.environmentService.getByKey(
          EnvConstants.PINPOINT_FLUSH_INTERVAL,
        ),
        appId: this.environmentService.getByKey(EnvConstants.PINPOINT_APP_ID),
        logger: {
          debug: (message, metadata) => {
            this.loggerService.debug(message, {
              context: 'pinpoint_service.save_events',
              error: message,
              extraInfo: metadata,
            });
          },
          error: (e, metadata) => {
            this.loggerService.error({
              context: 'pinpoint_service.save_events',
              stack: e.stack,
              error: e.message,
              extraInfo: metadata,
            });
          },
        },
      },
      save: this.saveEvents.bind(this),
    });
  }

  private saveEvents(payload: PutEventsRequest) {
    return this.redisService.savePinpointEvents(payload);
  }

  public add(event: PinpointEvent): string {
    this._queue.add(event);
    return event.id;
  }

  public drain() {
    return this._queue.drain();
  }

  public constructPayloadFromLogMessage(params: {
    level: 'info' | 'error';
    payload: LogMessage;
  }) {
    const {
      level, payload,
    } = params;
    // where to truncate the event value with the length is longer than 200 characters
    // 2 bellow lines are used to reduce the length of the event key.
    const clone = cloneDeep(payload);
    const result = {
      level,
      version: null,
      context: clone.context,
      stack: clone.stack,
      anonymousUserId: clone.anonymousUserId,
      userId: clone.userId,
      LuminUserId: clone.userId,
      userAgent: clone.userAgent,
      error: clone.error,
      errorCode: clone.errorCode,
      data: clone.extraInfo,
    };
    const { redirectUrl, currentURL } = result.data as {
      redirectUrl: string;
      currentURL: string;
    };
    if (redirectUrl) {
      result.data.redirectUrl = this.extractUrl(redirectUrl);
    }

    if (currentURL) {
      result.data.currentURL = this.extractUrl(currentURL);
    }

    return result;
  }

  private extractUrl(url: string) {
    const u = new URL(url);
    const searchObj = {};
    if (u.search) {
      const searchParams = new URLSearchParams(u.search);
      if (searchParams.has(UrlSearchParam.LOGIN_HINT)) {
        searchParams.delete(UrlSearchParam.LOGIN_HINT);
      }
      searchParams.forEach((value, key) => {
        searchObj[key] = value;
      });
      u.search = searchParams.toString();
    }
    return {
      origin: u.origin,
      pathname: u.pathname,
      query: u.search && searchObj,
    };
  }
}
