import { AuthenticationResult, PublicClientApplication } from '@azure/msal-browser';

import { environment } from '@/configs/environment';
import { LoggerReason } from '@/constants/logger';
import { clientLogger } from '@/lib/logger';
import { getErrorMessage } from '@/utils/error.utils';

type EventCallback = (...args: unknown[]) => void;

type Event = 'initialized' | 'redirect' | 'error';

class SimpleEventEmitter {
  private listeners = new Map<Event, EventCallback[]>();

  on(event: Event, callback: EventCallback) {
    const list = this.listeners.get(event) ?? [];
    list.push(callback);
    this.listeners.set(event, list);
  }

  off(event: Event, callback: EventCallback) {
    const list = this.listeners.get(event);
    if (!list) {
      return;
    }
    this.listeners.set(
      event,
      list.filter(fn => fn !== callback)
    );
  }

  emit(event: Event, ...args: unknown[]) {
    const list = this.listeners.get(event) ?? [];
    list.forEach(fn => fn(...args));
  }
}

class MicrosoftClient extends SimpleEventEmitter {
  private pca: PublicClientApplication;
  private isInitialized = false;
  private storedRedirectResult: AuthenticationResult | null = null;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    try {
      this.pca = new PublicClientApplication({
        auth: {
          clientId: environment.public.microsoft.clientId,
          authority: environment.public.microsoft.authority,
          redirectUri: environment.public.host.authUrl
        }
      });

      await this.pca.initialize();
      this.isInitialized = true;

      this.handleRedirectPromise();
    } catch (error) {
      this.emit('error', error);
      clientLogger.error({ message: getErrorMessage(error), reason: LoggerReason.ENABLE_SOCIAL_SIGN_IN, attributes: error as Record<string, unknown> });
    }
  }

  private handleRedirectPromise = async () => {
    try {
      const result = await this.pca.handleRedirectPromise();
      this.storedRedirectResult = result;
      this.emit('redirect', result);
    } catch (error) {
      this.emit('error', error);
      clientLogger.error({ message: getErrorMessage(error), reason: LoggerReason.ENABLE_SOCIAL_SIGN_IN, attributes: error as Record<string, unknown> });
    }
  };

  onRedirect(callback: (result: AuthenticationResult | null) => void) {
    if (this.storedRedirectResult) {
      callback(this.storedRedirectResult);
      return;
    }
    this.on('redirect', callback as EventCallback);
  }

  loginRedirect(loginHint?: string): Promise<void> {
    if (!this.isInitialized) {
      return Promise.resolve();
    }
    return this.pca.loginRedirect({
      loginHint,
      scopes: ['openid', 'email', 'profile']
    });
  }
}

const microsoftClient = new MicrosoftClient();
export { microsoftClient };
