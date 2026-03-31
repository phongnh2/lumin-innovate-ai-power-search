/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { v4 } from 'uuid';

import { oneDriveServices } from 'services';

type TCallback = () => void;

type TOneDriveEvent = 'access_token_loaded' | 'client_initialized';

type LoadOptions = {
  reInitialize?: boolean;
  clientId?: string;
};

interface IOneDriveClientLoader {
  load(options?: LoadOptions): OneDriveHookSubscriber;
}

class OneDriveHookSubscriber {
  private clientLoadedEvent: TCallback = () => {};

  private clientInitializedEvent: TCallback = () => {};

  private state: Record<TOneDriveEvent, boolean> = {
    access_token_loaded: false,
    client_initialized: false,
  };

  constructor(state: Record<TOneDriveEvent, boolean>) {
    this.state = state;
  }

  notify(event: TOneDriveEvent): { destroy: boolean } {
    this.state[event] = true;
    switch (event) {
      case 'access_token_loaded':
        this.clientLoadedEvent();
        break;
      case 'client_initialized':
        this.clientInitializedEvent();
        break;
      default:
        break;
    }

    return {
      destroy: Object.values(this.state).every((_s) => _s),
    };
  }

  on(event: TOneDriveEvent, cb: TCallback): this {
    switch (event) {
      case 'client_initialized':
        this.clientInitializedEvent = cb;
        break;
      case 'access_token_loaded':
        this.clientLoadedEvent = cb;
        break;
      default:
        break;
    }
    if (this.state[event]) {
      this.notify(event);
    }
    return this;
  }

  async wait(event: TOneDriveEvent): Promise<void> {
    await new Promise((resolve) => {
      this.on(event, () => resolve(1));
    });
  }
}

class OneDriveClientLoader implements IOneDriveClientLoader {
  private called = false;

  private state: Record<TOneDriveEvent, boolean> = {
    access_token_loaded: false,
    client_initialized: false,
  };

  private subscribers = new Map<string, OneDriveHookSubscriber>();

  getState(event: TOneDriveEvent) {
    return this.state[event];
  }

  notify(event: TOneDriveEvent): void {
    this.state[event] = true;
    this.subscribers.forEach((s, sid) => {
      const { destroy } = s.notify(event);
      if (destroy) {
        this.subscribers.delete(sid);
      }
    });
  }

  private async internalLoad(clientId?: string): Promise<void> {
    await oneDriveServices.createPublicClientApplication(clientId);
    this.notify('client_initialized');
  }

  load(options?: LoadOptions): OneDriveHookSubscriber {
    const { reInitialize = false, clientId = '' } = options || {};
    if (reInitialize) {
      this.called = false;
      this.state.client_initialized = false;
    }

    const subscriber = new OneDriveHookSubscriber(this.state);
    this.subscribers.set(v4(), subscriber);
    if (this.called) {
      return subscriber;
    }
    this.called = true;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.internalLoad(clientId);
    return subscriber;
  }
}

export const oneDriveLoader = new OneDriveClientLoader();
