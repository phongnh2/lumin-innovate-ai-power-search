/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { AnyAction } from 'redux';
import { v4 } from 'uuid';

import actions from 'actions';

import loadScript from 'helpers/loadScript';

import { loadGoogleClient } from 'utils/loadGoogleClient';

import { LocalStorageKey } from 'constants/localStorageKey';

import { store } from '../../redux/store';

const { dispatch } = store;

type TCallback = () => void;

type TGoogleEvent = 'client_loaded' | 'client_initialized' | 'drive_loaded';

interface IGoogleClientLoader {
  load(): GoogleHookSubscriber;
}

class GoogleHookSubscriber {
  private clientLoadedEvent: TCallback = () => {};

  private driveLoadedEvent: TCallback = () => {};

  private clientInitializedEvent: TCallback = () => {};

  private state: Record<TGoogleEvent, boolean> = {
    client_loaded: false,
    client_initialized: false,
    drive_loaded: false,
  };

  constructor(state: Record<TGoogleEvent, boolean>) {
    this.state = state;
  }

  notify(event: TGoogleEvent): { destroy: boolean } {
    this.state[event] = true;
    switch (event) {
      case 'client_loaded':
        this.clientLoadedEvent();
        break;
      case 'client_initialized':
        this.clientInitializedEvent();
        break;
      case 'drive_loaded':
        this.driveLoadedEvent();
        break;
      default:
        break;
    }

    return {
      destroy: Object.values(this.state).every((_s) => _s),
    };
  }

  on(event: TGoogleEvent, cb: TCallback): this {
    switch (event) {
      case 'client_loaded':
        this.clientLoadedEvent = cb;
        break;
      case 'client_initialized':
        this.clientInitializedEvent = cb;
        break;
      case 'drive_loaded':
        this.driveLoadedEvent = cb;
        break;
      default:
        break;
    }
    if (this.state[event]) {
      this.notify(event);
    }
    return this;
  }

  async wait(event: TGoogleEvent): Promise<void> {
    await new Promise((resolve) => {
      this.on(event, () => resolve(1));
    });
  }
}

class GoogleClientLoader implements IGoogleClientLoader {
  private called = false;

  private state: Record<TGoogleEvent, boolean> = {
    client_loaded: false,
    client_initialized: false,
    drive_loaded: false,
  };

  private subscribers = new Map<string, GoogleHookSubscriber>();

  private notify(event: TGoogleEvent): void {
    this.state[event] = true;
    this.subscribers.forEach((s, sid) => {
      const { destroy } = s.notify(event);
      if (destroy) {
        this.subscribers.delete(sid);
      }
    });
  }

  private async internalLoad(): Promise<void> {
    if (document.referrer.includes('microsoft-store')) {
      window.lMode = 'PWA';
      Object.defineProperty(document, 'referrer', {
        get() {
          return '';
        },
      });
    }
    await Promise.all([loadScript(`https://accounts.google.com/gsi/client?v=${process.env.VERSION}`, '', { async: true }), loadGoogleClient()]);
    window.gapi.load('client', () => {
      this.notify('client_loaded');
      window.gapi.client
        .init({
          // NOTE: OAuth2 'scope' and 'client_id' parameters have moved to signIn().
        })
        .then(() => {
          this.notify('client_initialized');
          if (!window.gapi.client.getToken()) {
            const oauth2Token = localStorage.getItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN);
            if (oauth2Token) {
              window.gapi.client.setToken(JSON.parse(oauth2Token));
            }
          }
          if (!window.gapi.client.drive) {
            window.gapi.client.load('drive', 'v3', () => {
              this.notify('drive_loaded');
              console.info('Gapi has been loaded.');
            });
          }
          dispatch(actions.loadGapiSuccess() as AnyAction);
        })
        .catch((e) => {
          console.error(e);
        });
    });
  }

  load(): GoogleHookSubscriber {
    const subscriber = new GoogleHookSubscriber(this.state);
    this.subscribers.set(v4(), subscriber);
    if (this.called) {
      return subscriber;
    }
    this.called = true;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.internalLoad();
    return subscriber;
  }
}

export const gapiLoader = new GoogleClientLoader();
