import { environment } from '@/configs/environment';
import { CookieStorageKey } from '@/constants/cookieKey';
import CookieUtils from '@/utils/cookie.utils';

import { TDatadogInstance } from '../datadog';

import { BaseLogger } from './base.logger';

export type TClientLogger = {
  reason: string;
  message: string;
  attributes: Record<string, unknown>;
};
// This logger was used to log to datadog on the client side
export class ClientLogger extends BaseLogger {
  private datadogLogs: TDatadogInstance | null;
  constructor() {
    super();
    this.datadogLogs = null;
    this.createLogger();
  }

  getInstance = async (): Promise<TDatadogInstance> => {
    const instance = await import('../datadog');
    return instance.default;
  };

  getBaseParams({ reason, message, attributes }: TClientLogger): [string, Record<string, unknown>] {
    return [message, { ...attributes, reason, ...this.getCommonInfo() }];
  }

  createLogger = () =>
    this.getInstance().then(logger => {
      this.datadogLogs = logger;
      logger.init({
        clientToken: environment.public.datadog.clientToken,
        site: 'datadoghq.com',
        service: 'lumin-auth',
        env: environment.public.common.environment,
        version: environment.public.common.version,
        forwardErrorsToLogs: true,
        beforeSend: (logData: any) => {
          try {
            const message = JSON.parse(logData.message);
            logData.message = JSON.stringify({
              ...message,
              ...{ anonymousUserId: CookieUtils.get(CookieStorageKey.ANONYMOUS_USER_ID) }
            });
          } catch (_) {
            // For console.error || unhandled rejection || network error, `message` is a string
            logData.message = JSON.stringify({
              message: logData.message,
              ...{ anonymousUserId: CookieUtils.get(CookieStorageKey.ANONYMOUS_USER_ID) }
            });
          }
          return true;
        }
      });
    });

  info = ({ reason, message, attributes }: TClientLogger) => this.datadogLogs?.logger.info(...this.getBaseParams({ reason, message, attributes }));

  warn = ({ reason, message, attributes }: TClientLogger) => this.datadogLogs?.logger.warn(...this.getBaseParams({ reason, message, attributes }));

  error = ({ reason, message, attributes }: TClientLogger) => this.datadogLogs?.logger.error(...this.getBaseParams({ reason, message, attributes }));
}

export const clientLogger = new ClientLogger();
