import logger from 'helpers/logger';

import { isElectron } from 'utils/corePathHelper';

import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER } from 'constants/lumin-common';

export interface DropboxAuthResult {
  token?: string | null;
  state?: string | null;
  error?: string | null;
}

export type DropboxAuthListener = (payload: DropboxAuthResult) => void;

class ElectronDropboxServices {
  private listeners: Set<DropboxAuthListener>;

  private electronUnsubscribe?: () => void;

  constructor() {
    this.listeners = new Set();
    this.initializeListener();
  }

  private initializeListener() {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isElectron()) {
      return;
    }

    if (!window.electronAPI?.onDropboxAuthCompleted) {
      return;
    }

    this.electronUnsubscribe = window.electronAPI.onDropboxAuthCompleted((_, payload: DropboxAuthResult = {}) => {
      this.handleAuthCompleted(payload);
    });
  }

  private ensureListenerInitialized() {
    if (!this.electronUnsubscribe) {
      this.initializeListener();
    }
  }

  private handleAuthCompleted(payload: DropboxAuthResult = {}) {
    const { token, state, error } = payload;

    if (token) {
      localStorage.setItem(LocalStorageKey.DROPBOX_TOKEN, token);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dropboxAuthorized', {
          detail: {
            token: token ?? null,
            errorMessage: error ?? null,
            cancelAuthorize: Boolean(error) && !token,
          },
        })
      );
    }

    this.listeners.forEach((listener) => {
      listener({
        token: token ?? null,
        state: state ?? null,
        error: error ?? null,
      });
    });
  }

  subscribe(listener: DropboxAuthListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async authenticate(options: { authorizeUrl: string; state?: string }) {
    if (!isElectron()) {
      throw new Error('This method is only available in Electron environment');
    }

    this.ensureListenerInitialized();

    const { electronAPI } = window;

    if (!electronAPI?.authenticateWithDropbox) {
      throw new Error('Electron API not available or authenticateWithDropbox method missing');
    }

    try {
      const result: DropboxAuthResult | null = await electronAPI.authenticateWithDropbox(options);

      if (result?.token) {
        localStorage.setItem(LocalStorageKey.DROPBOX_TOKEN, result.token);
      }

      return result;
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.DROPBOX_API_ERROR,
        error: error as Error,
        message: `Dropbox authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      throw error;
    }
  }
}

const electronDropboxServices = new ElectronDropboxServices();

export default electronDropboxServices;
