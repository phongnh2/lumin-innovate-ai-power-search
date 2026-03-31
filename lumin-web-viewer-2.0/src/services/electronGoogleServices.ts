import logger from 'helpers/logger';

import commonUtils from 'utils/common';
import { isElectron } from 'utils/corePathHelper';
import {
  getDriveUserRestrictedDomain,
  getDriveUserRestrictedEmail,
  openCannotAuthorizeModal,
} from 'utils/restrictedUserUtil';

import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER } from 'constants/lumin-common';

import { IUser } from 'interfaces/user/user.interface';

import { GoogleOAuthTokens } from './types/googleServices.types';
import { gapiLoader } from '../navigation/Router/setupGoogleClient';

interface GoogleUserInfo {
  email: string;
  id: string;
  name: string;
  picture?: string;
}

export interface GoogleTokenData {
  access_token: string;
  scope: string;
  email: string;
  userRemoteId?: string;
}

export interface AuthenticateOptions {
  callback?: (tokenData: GoogleTokenData) => void;
  onError?: (error: Error) => void;
  prompt?: 'consent' | 'select_account' | '';
  loginHint?: string;
  scope?: string[];
  restrictedEmail?: string;
}

export class ElectronGoogleServices {
  accessToken: string | null;

  refreshToken: string | null;

  expiresAt: number | null;

  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
  }

  // === PUBLIC AUTHENTICATION METHODS ===

  async authenticate(options: AuthenticateOptions = {}): Promise<GoogleTokenData> {
    if (!isElectron()) {
      throw new Error('This method is only available in Electron environment');
    }

    const { callback, onError, prompt = 'select_account', loginHint, scope } = options;

    try {
      if (ElectronGoogleServices.isValidToken() && !prompt) {
        const tokenData = ElectronGoogleServices.getStoredTokenData();
        if (tokenData) {
          if (callback) callback(tokenData);
          return tokenData;
        }
      }

      const currentUser = await this.getCurrentUserFromStore();
      const restrictedEmail = getDriveUserRestrictedEmail(currentUser?.email) || null;

      const tokenData = await this.authenticateWithBrowserWindow({
        prompt: prompt || 'select_account',
        loginHint: restrictedEmail || loginHint || '',
        scope,
      });

      const isValid = await this.validateAuthenticatedEmail(tokenData, restrictedEmail, options);

      if (!isValid) {
        return null;
      }

      if (callback) callback(tokenData);
      return tokenData;
    } catch (error: unknown) {
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error: error as Error,
        message: 'Google authentication failed',
      });
      if (onError) onError(error as Error);
      throw error;
    }
  }

  signOut() {
    localStorage.removeItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN);
    localStorage.removeItem(LocalStorageKey.EXPIRE_TIME_GOOGLE_IMPLICIT_ACCESS_TOKEN);

    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;

    if (window.gapi?.client) {
      window.gapi.client.setToken(null);
    }
  }

  // === PUBLIC TOKEN MANAGEMENT ===

  async storeTokens(tokens: GoogleOAuthTokens) {
    const { access_token, refresh_token, expires_in, scope } = tokens;

    this.accessToken = access_token;
    this.refreshToken = refresh_token;
    this.expiresAt = Date.now() + expires_in * 1000;

    const tokenData: GoogleTokenData = {
      access_token,
      scope,
      email: await ElectronGoogleServices.getUserEmail(access_token),
    };

    this.storeTokenData(tokenData);
  }

  // === PUBLIC STATIC UTILITY METHODS ===

  static isValidToken(): boolean {
    const expiresAt = localStorage.getItem(LocalStorageKey.EXPIRE_TIME_GOOGLE_IMPLICIT_ACCESS_TOKEN);
    if (!expiresAt) {
      return false;
    }

    return Date.now() < parseInt(expiresAt);
  }

  static isSignedIn() {
    return !!ElectronGoogleServices.getStoredTokenData() && ElectronGoogleServices.isValidToken();
  }

  // === PRIVATE AUTHENTICATION METHODS ===

  private async authenticateWithBrowserWindow(options: {
    prompt?: string;
    loginHint?: string;
    scope?: string[];
  }): Promise<GoogleTokenData> {
    if (!window.electronAPI?.authenticateWithGoogle) {
      throw new Error('Electron API not available or authenticateWithGoogle method missing');
    }

    try {
      const tokenData: GoogleTokenData = await window.electronAPI.authenticateWithGoogle(options);

      if (!tokenData) {
        throw new Error('Authentication failed: No token data received');
      }

      this.storeTokenData(tokenData);

      return tokenData;
    } catch (error) {
      logger.logError({
        context: this.authenticateWithBrowserWindow.name,
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error: error as Error,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async validateAuthenticatedEmail(
    tokenData: GoogleTokenData,
    restrictedEmail: string | null,
    options: AuthenticateOptions
  ): Promise<boolean> {
    if (!tokenData?.email) {
      return false;
    }

    const currentUser = await this.getCurrentUserFromStore();
    if (!currentUser || !restrictedEmail) {
      return true;
    }

    const domainFromTokenInfo = commonUtils.getDomainFromEmail(tokenData.email);
    const isRestrictedDomain = getDriveUserRestrictedDomain().includes(domainFromTokenInfo);

    if ((restrictedEmail || isRestrictedDomain) && restrictedEmail !== tokenData.email) {
      const onConfirm = async () => {
        this.signOut();
        await this.authenticate({
          ...options,
          prompt: options.prompt || 'select_account',
          loginHint: restrictedEmail,
          restrictedEmail,
        }).catch((error) => {
          logger.logError({
            reason: LOGGER.Service.GOOGLE_API_ERROR,
            error: error as Error,
            message: 'Re-authentication failed after restriction check',
          });
        });
      };

      openCannotAuthorizeModal({
        restrictedEmail,
        onConfirm,
        restrictedDomain: domainFromTokenInfo,
      });

      return false;
    }

    return true;
  }

  private async getCurrentUserFromStore(): Promise<IUser | null> {
    try {
      const { store } = await import('store');
      const selectors = (await import('selectors')).default;
      const state = store.getState();
      return selectors.getCurrentUser(state);
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error: error as Error,
        message: 'Failed to get current user from store',
      });
      return null;
    }
  }

  // === PRIVATE TOKEN AND DATA MANAGEMENT ===

  private storeTokenData(tokenData: GoogleTokenData): void {
    localStorage.setItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN, JSON.stringify(tokenData));
    localStorage.setItem(
      LocalStorageKey.EXPIRE_TIME_GOOGLE_IMPLICIT_ACCESS_TOKEN,
      (Date.now() + 3600 * 1000).toString()
    );

    if (window.gapi?.client) {
      window.gapi.client.setToken(tokenData);
    }
  }

  private static getStoredTokenData(): GoogleTokenData | null {
    const tokenData = localStorage.getItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN);
    return tokenData ? (JSON.parse(tokenData) as GoogleTokenData) : null;
  }

  // === PRIVATE GOOGLE API METHODS ===

  private static async getUserEmail(accessToken: string): Promise<string> {
    const originalToken = window.gapi?.client?.getToken();

    try {
      await ElectronGoogleServices.ensureGapiReady();
      await ElectronGoogleServices.loadOAuth2Client();

      window.gapi.client.setToken({ access_token: accessToken });

      const oauth2Client = (window.gapi.client as Record<string, unknown>).oauth2 as {
        userinfo: {
          get: () => Promise<{ result: GoogleUserInfo }>;
        };
      };

      const response = await oauth2Client.userinfo.get();
      return response.result.email;
    } catch (error: unknown) {
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error: error as Error,
        message: 'Failed to get user email',
      });
      return '';
    } finally {
      if (originalToken && window.gapi?.client) {
        window.gapi.client.setToken(originalToken);
      }
    }
  }

  private static async ensureGapiReady(): Promise<void> {
    if (!window.gapi?.client) {
      const subscriber = gapiLoader.load();
      await subscriber.wait('client_initialized');
    }
  }

  private static async loadOAuth2Client(): Promise<void> {
    if (!(window.gapi.client as Record<string, unknown>).oauth2) {
      await window.gapi.client.load('oauth2', 'v2');
    }
  }
}

export default new ElectronGoogleServices();
