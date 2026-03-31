import pino, { Logger, levels } from 'pino';

import { environment } from '@/configs/environment';
import { NetworkConstants } from '@/constants/common';
import { CookieStorageKey } from '@/constants/cookieKey';
import type { TIdentityRequest } from '@/interfaces/common';
import { jsonStringify } from '@/utils/json.utils';
import { getIpAddress } from '@/utils/network.utils';

const enum LoggerLevelEnum {
  Info = 'info',
  Error = 'error',
  Warn = 'warn'
}

const SENSITIVE_KEYS = [
  {
    key: 'Authorization',
    match: /"Authorization":\s*"Bearer\s*[^"]*"/,
    replace: `"Authorization": ''`
  }
];

class AppLogger {
  private logger: Logger;

  private env: string;

  private version: string;

  sanitizeMessage(payload: object): string {
    let message = jsonStringify(payload);
    SENSITIVE_KEYS.forEach(({ match, replace }) => {
      message = message.replace(match, replace);
    });
    return message;
  }

  constructor() {
    this.logger = pino({
      formatters: {
        level: label => ({ level: label }),
        bindings: () => ({})
      },
      timestamp: () => `,"timestamp": ${new Date(Date.now()).toISOString()}`,
      hooks: {
        logMethod: (args, _, level) => {
          switch (level) {
            case levels.values[LoggerLevelEnum.Info]:
              console.log(
                this.sanitizeMessage(
                  this.modifyLoggerPinoBrowser(
                    {
                      ...args[0],
                      msg: args[1]
                    },
                    LoggerLevelEnum.Info
                  )
                )
              );
              break;
            case levels.values[LoggerLevelEnum.Warn]:
              console.warn(
                this.sanitizeMessage(
                  this.modifyLoggerPinoBrowser(
                    {
                      ...args[0],
                      msg: args[1]
                    },
                    LoggerLevelEnum.Warn
                  )
                )
              );
              break;
            case levels.values[LoggerLevelEnum.Error]:
              console.error(
                this.sanitizeMessage(
                  this.modifyLoggerPinoBrowser(
                    {
                      ...args[0],
                      msg: args[1]
                    },
                    LoggerLevelEnum.Error
                  )
                )
              );
              break;
            default:
              break;
          }
        }
      },
      browser: {
        asObject: true,
        write: {
          info: logInfo => {
            console.log(jsonStringify(this.modifyLoggerPinoBrowser(logInfo, LoggerLevelEnum.Info)));
          },
          error: logError => {
            console.error(jsonStringify(this.modifyLoggerPinoBrowser(logError, LoggerLevelEnum.Error)));
          },
          warn: logWarn => {
            console.warn(jsonStringify(this.modifyLoggerPinoBrowser(logWarn, LoggerLevelEnum.Warn)));
          }
        }
      }
    });
    this.env = environment.public.common.environment;
    this.version = environment.public.common.version;
  }

  modifyLoggerPinoBrowser(loggerInput: object, level: string): object {
    const timestamp = new Date(Date.now()).toISOString();
    delete (loggerInput as any)['time'];
    return { ...loggerInput, timestamp, level };
  }

  public getCommonHttpAttributes(request: TIdentityRequest) {
    const url = request.url || '';
    const urlIndex = url.indexOf('?');
    const index = urlIndex > 0 ? urlIndex : url.length;
    return {
      context: url.slice(0, index),
      origin: request.headers.origin,
      ...this.getCommonAttributes(request)
    };
  }

  public getCommonAttributes(request: TIdentityRequest) {
    return {
      userAgent: request?.headers[NetworkConstants.USER_AGENT],
      ipAddress: getIpAddress(request),
      anonymousUserId: request?.cookies?.[CookieStorageKey.ANONYMOUS_USER_ID] || ''
    };
  }

  info({ message, meta }: { message: string; meta?: Record<string, unknown> }): void {
    this.logger.info({ ...meta, version: this.version, env: this.env }, message);
  }

  error({ err, message, meta, scope }: { err: Error; message?: string; meta?: Record<string, unknown>; scope: string }): void {
    this.logger.error({ ...meta, stack: err?.stack, version: this.version, env: this.env, scope }, message || err.message);
  }

  warn({ message, meta }: { message: string; meta?: Record<string, unknown> }): void {
    this.logger.warn({ ...meta, version: this.version, env: this.env }, message);
  }
}

export const logger = new AppLogger();
