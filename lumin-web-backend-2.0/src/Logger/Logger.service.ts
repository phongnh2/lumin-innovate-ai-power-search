import { Injectable, Scope } from '@nestjs/common';
import * as chalk from 'chalk';
import { Request } from 'express';
import { cloneDeep, isNil } from 'lodash';
import {
  createLogger, format, transports, Logger,
} from 'winston';
import { ConsoleTransportOptions } from 'winston/lib/winston/transports';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { EnvironmentService } from 'Environment/environment.service';

export interface LogMessage {
  /* Operation name or http endpoint */
  context?: string;
  /* Error stack */
  stack?: string;
  anonymousUserId?: string;
  userId?: string;
  userAgent?: string;
  error?: any;
  ipAddress?: string;
  /* Application error code */
  errorCode?: string;
  extraInfo?: any;
  message?: string;
}

interface DeviceLog {
  deviceId: string;
  userId: string;
  platform: string;
  deviceModel: string;
  apiLevel: number;
  isRooted: boolean;
  error?: string;
}

interface ContactLog {
  context: string;
  error: any;
  contactId?: string;
  properties?: any;
  teamId?: string;
}

interface RateLimitLog extends LogMessage {
  ipAddress: string
}

const LogLevels = ['debug', 'info', 'warn', 'error'] as const;

const sensitivePatterns: Record<string, RegExp> = {
  email: /^(?:user)?(?:email|mail)(?:address|addr)?$/i,

  personal: /^(?:ssn|social|tax|passport|driver|license|phone|mobile|tel|address|zip|postal|dob|birth)/i,

  auth: /^(?:password|passwd|pwd|secret|token|credential|auth|bearer)(?:hash|encrypted|token)?$/i,

  session: /^(?:cookie|session)(?:id|token|key)?$/i,

  apiKey: /^(?:api|service)(?:key|token|secret)$/i,

  authorization: /^authorization/i,

  payment: /^(?:credit|card|cvv|ccv|payment)(?:card|number|num|no|id)?$/i,

  privateKeys: /^(?:private|public)key$/i,

  accessTokens: /^(?:access|refresh)token$/i,

  specificKeys: /^(?:api|private|public|service|session|access|refresh)key$/i,
};

export type LogLevel = typeof LogLevels[number];

@Injectable({ scope: Scope.DEFAULT })
export class LoggerService {
  private _logger: Logger;

  private _logLevel: LogLevel;

  // eslint-disable-next-line global-require
  v8 = require('v8');

  constructor(private readonly environmentService: EnvironmentService) {
    const levelEnv = this.environmentService.getByKey(EnvConstants.LOG_LEVEL) as LogLevel;
    this._logLevel = LogLevels.includes(levelEnv) ? levelEnv : 'info';
    this.createLogger();
    if (this.environmentService.isDevelopment) {
      return;
    }
    const convert = (number: number) => (Math.round(number / 1024 / 1024 / 1024 * 100) / 100).toFixed(2);
    setInterval(() => {
      const stats = process.memoryUsage();
      this.info({
        context: 'Memory stats',
        extraInfo: {
          rss: convert(stats.rss),
          heapLimit: convert(this.v8.getHeapStatistics().heap_size_limit as number),
          heapUsed: convert(stats.heapUsed),
          external: convert(stats.external),
        },
      });
    }, 120000);
  }

  get commonAttributes() {
    return {
      version: this.environmentService.getByKey('VERSION'),
      env: this.environmentService.getByKey('ENV'),
    };
  }

  private colorizePrimitive(value: any): string {
    if (value === null) {
      return chalk.gray('null');
    }
    if (value === undefined) {
      return chalk.gray('undefined');
    }

    switch (typeof value) {
      case 'boolean':
      case 'number':
        return chalk.yellow(String(value));
      case 'string':
        return chalk.green(`"${value}"`);
      default:
        return String(value);
    }
  }

  private colorizeArray(arr: any[], indent: number): string {
    if (arr.length === 0) return '[]';

    const indentStr = '  '.repeat(indent);
    const nextIndentStr = '  '.repeat(indent + 1);
    const items = arr
      .map((item) => `${nextIndentStr}${this.colorizeJson(item, indent + 1)}`)
      .join(',\n');

    return `[\n${items}\n${indentStr}]`;
  }

  private colorizeObject(obj: Record<string, unknown>, indent: number): string {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';

    const indentStr = '  '.repeat(indent);
    const nextIndentStr = '  '.repeat(indent + 1);
    const items = keys
      .map((key) => {
        const coloredKey = chalk.cyan(`"${key}"`);
        const coloredValue = this.colorizeJson(obj[key], indent + 1);
        return `${nextIndentStr}${coloredKey}: ${coloredValue}`;
      })
      .join(',\n');

    return `{\n${items}\n${indentStr}}`;
  }

  colorizeJson(obj: any, indent = 0): string {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return this.colorizePrimitive(obj);
    }

    if (Array.isArray(obj)) {
      return this.colorizeArray(obj, indent);
    }

    return this.colorizeObject(obj as Record<string, unknown>, indent);
  }

  getFormattedMessage(message: string) {
    if (typeof message !== 'string') {
      return message;
    }
    try {
      const parsed = JSON.parse(message);
      if (this.environmentService.isDevelopment) {
        return this.colorizeJson(parsed);
      }
      return JSON.stringify(parsed, null, 2);
    } catch (err) {
      return message;
    }
  }

  developmentFormat: ConsoleTransportOptions = {
    format: format.combine(
      format.timestamp({
        format: new Date().toLocaleString('vi'),
      }),
      format.printf(
        ({
          timestamp, level, message, context, trace,
        }) => {
          let levelDisplay: string;
          switch (level) {
            case 'error':
              levelDisplay = chalk.bgRed.whiteBright.bold(' ❌  ERROR ');
              break;
            case 'warn':
              levelDisplay = chalk.bgYellow.black.bold(' ⚠️  WARN ');
              break;
            case 'info':
              levelDisplay = chalk.bgBlue.whiteBright.bold(' ℹ️  INFO ');
              break;
            case 'debug':
              levelDisplay = chalk.bgMagenta.whiteBright.bold(' 🔍  DEBUG ');
              break;
            default:
              levelDisplay = chalk.bgGray.whiteBright.bold(' 📝 LOG ');
          }

          const separator = chalk.gray('─'.repeat(80));
          const contextStr = chalk.cyan(`[${JSON.stringify(context)}]`);
          const timestampStr = chalk.dim(JSON.stringify(timestamp));
          const formattedMsg = this.getFormattedMessage(message as string);
          const traceStr = trace ? `\n${chalk.red(JSON.stringify(trace))}` : '';

          return `\n${separator}\n${levelDisplay} ${contextStr} ${timestampStr}\n${formattedMsg}${traceStr}\n${separator}`;
        },
      ),
    ),
  };

  redact = format((info) => {
    const cloneInfo = cloneDeep(info);
    const logMessage = info.message;
    if (logMessage) {
      try {
        const _message = typeof logMessage === 'string' ? JSON.parse(logMessage) : logMessage;

        const jsonStringifyReplacer = () => {
          const seenValues = [];
          return (key: string, value: any) => {
            if (key && this.isSensitiveField(key)) {
              return undefined;
            }
            // check circular references
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            if (typeof value === 'object' && value !== null && Object.keys(value).length) {
              const stackSize = seenValues.length;
              if (stackSize) {
                // clean up expired references
                for (let n = stackSize - 1; seenValues[n][key] !== value; --n) {
                  seenValues.pop();
                }
                if (seenValues.includes(value)) {
                  return '[Circular]';
                }
              }
              seenValues.push(value);
            }
            return value;
          };
        };

        cloneInfo.message = JSON.stringify(_message, jsonStringifyReplacer());
      } catch (err) {
        return cloneInfo;
      }
    }

    return cloneInfo;
  });

  createLogger = () => {
    this._logger = createLogger({
      level: this._logLevel,
      exitOnError: false,
      format: this.environmentService.isDevelopment
        ? format.json()
        : format.combine(this.redact(), format.json()),
      transports: [
        new transports.Console(
          this.environmentService.isDevelopment
            ? this.developmentFormat
            : { format: format.json() },
        ),
      ],
    });
  };

  getIpAddress(request): string {
    return request?.headers[CommonConstants.X_FORWARDED_FOR_HEADER]
    || request?.headers[CommonConstants.CF_CONNECTING_IP]
    || request?.headers[CommonConstants.TRUE_CLIENT_IP]
    || CommonConstants.DEFAULT_IP_ADDRESS;
  }

  public getCommonHttpAttributes(request: Request): LogMessage {
    const requestUrl = (request.originalUrl || request.url).substr(1);
    const urlIndex = requestUrl.indexOf('?');
    const index = urlIndex > 0 ? urlIndex : requestUrl.length;
    return {
      context: requestUrl.slice(0, index),
      ...this.getCommonAttributes(request),
    };
  }

  public getCommonAttributes(request: Request | IGqlRequest): LogMessage {
    return {
      userId: request?.user?._id || '',
      anonymousUserId: request?.anonymousUserId || request?.cookies?.[CommonConstants.ANONYMOUS_USER_ID_COOKIE],
      userAgent: request?.headers['user-agent'],
      ipAddress: this.getIpAddress(request),
    };
  }

  public getCommonVariables(request: IGqlRequest) {
    return {
      orgId: request?.body?.variables?.orgId,
      targetId: request?.body?.variables?.userId,
      teamId: request?.body?.variables?.teamId,
    };
  }

  // For logging some error object that can't be stringified
  public getCommonErrorAttributes(error: any): Record<string, any> {
    if (!error) {
      return {};
    }
    const result: Record<string, any> = {};
    if (error.code) {
      result.errorCode = error.code;
    }
    if (error.stack) {
      result.stack = error.stack;
    }
    if (error.message) {
      result.error = error.message;
    }
    return result;
  }

  private extractErrorMessage(error: any): string {
    if (!error) {
      return 'Unknown error';
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message || 'Error occurred';
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (typeof error === 'object' && error !== null) {
      try {
        return error.message || JSON.stringify(error);
      } catch (err) {
        return String(error);
      }
    }

    return String(error);
  }

  private log(level: LogLevel, message: string, metadata: any) {
    const filteredMetadata = this.filterSensitiveDataRecursive(metadata);
    this._logger.log(level, message, { ...(filteredMetadata as Record<string, unknown>), ...this.commonAttributes });
  }

  private _formatMsg(log: LogMessage) {
    const filteredLog = this.filterSensitiveDataRecursive(log) as LogMessage;
    if (filteredLog.error && typeof filteredLog.error === 'string') {
      return filteredLog.error;
    }
    return JSON.stringify(filteredLog);
  }

  private handleCircularReferences = (data: unknown, seen = new WeakSet()): unknown => {
    try {
      if (data === null || typeof data !== 'object') {
        return data;
      }

      if (seen.has(data)) {
        return '[Circular]';
      }

      seen.add(data);

      if (Array.isArray(data)) {
        return data.map((item) => this.handleCircularReferences(item, seen));
      }

      const result: Record<string, unknown> = {};
      // eslint-disable-next-line no-restricted-syntax
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          result[key] = this.handleCircularReferences((data as any)[key], seen);
        }
      }

      return result;
    } catch (error) {
      return { message: 'Data filtered due to circular reference complexity' };
    }
  };

  private filterSensitiveDataRecursive(data: unknown, depth = 0, seen = new WeakSet()): unknown {
    if (depth > 10) {
      return data;
    }

    if (isNil(data)) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    // Check for circular reference
    if (seen.has(data)) {
      return '[Circular]';
    }
    seen.add(data);

    if (Array.isArray(data)) {
      return data.map((item) => this.filterSensitiveDataRecursive(item, depth + 1, seen));
    }

    if (typeof data === 'object') {
      const filtered: Record<string, unknown> = {};
      Object.keys(data as Record<string, unknown>).forEach((key) => {
        if (!this.isSensitiveField(key)) {
          filtered[key] = this.filterSensitiveDataRecursive((data as Record<string, unknown>)[key], depth + 1, seen);
        }
      });
      return filtered;
    }

    return data;
  }

  private isSensitiveField = (fieldName: string): boolean => Object.values(sensitivePatterns).some((pattern) => pattern.test(fieldName));

  public info(log: LogMessage | DeviceLog | RateLimitLog): void {
    const msg = this._formatMsg(log);
    this.log('info', msg, log);
  }

  public warn(log: LogMessage | ContactLog): void {
    const msg = this._formatMsg(log);
    this.log('warn', msg, log);
  }

  public error(message: LogMessage): void {
    const errorMessages = message.error
      ? this.extractErrorMessage(message.error)
      : JSON.stringify(message);

    this.log('error', errorMessages, message);
  }

  public debug(message: string, metadata?: LogMessage): void {
    this.log('debug', message, metadata);
  }
}
