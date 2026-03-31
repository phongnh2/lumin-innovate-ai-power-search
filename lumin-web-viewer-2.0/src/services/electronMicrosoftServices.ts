import logger from 'helpers/logger';

import { isElectron } from 'utils/corePathHelper';
import { extractCidFromOid } from 'utils/microsoftAuthUtils';

import { LOGGER } from 'constants/lumin-common';

import { ONEDRIVE_TOKEN_TYPE, tokenStorageService, TokenStorageService, TokenType } from './TokenStorageService';

export interface MicrosoftTokenData {
  access_token: string;
  cid: string;
  scope: string;
  email?: string;
  oid?: string;
}

export interface AuthenticateOptions {
  callback?: (tokenData: MicrosoftTokenData) => void;
  onError?: (error: Error) => void;
  prompt?: 'consent' | 'select_account' | '';
  loginHint?: string;
  scopes?: string[];
  authority?: string;
  tokenType?: TokenType;
}

export class ElectronMicrosoftServices {
  private tokenStorage: TokenStorageService;

  constructor(tokenStorage: TokenStorageService = tokenStorageService) {
    this.tokenStorage = tokenStorage;
  }

  async authenticate(options: AuthenticateOptions = {}): Promise<MicrosoftTokenData | null> {
    if (!isElectron()) {
      throw new Error('This method is only available in Electron environment');
    }

    const {
      callback,
      onError,
      prompt = '',
      loginHint,
      scopes,
      authority,
      tokenType = ONEDRIVE_TOKEN_TYPE.FILE_ACCESS,
    } = options;

    try {
      const cachedTokenData = this.tokenStorage.getToken(tokenType);
      const hasRequiredScopes = this.tokenStorage.hasRequiredScopes(scopes || [], tokenType);
      const shouldRefresh = this.tokenStorage.shouldRefreshToken(tokenType);

      if (cachedTokenData && hasRequiredScopes && !prompt && !shouldRefresh) {
        const tokenData = this.convertStoredToTokenData(cachedTokenData);
        callback?.(tokenData);
        return tokenData;
      }

      const tokenData = await this.authenticateWithBrowserWindow({
        prompt: loginHint ? '' : prompt || 'select_account',
        loginHint: loginHint || '',
        scopes,
        authority,
      });

      if (!tokenData) {
        return null;
      }

      this.storeTokenData(tokenData, tokenType);
      callback?.(tokenData);
      return tokenData;
    } catch (error: unknown) {
      logger.logError({
        context: this.authenticate.name,
        reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
        message: error instanceof Error ? error.message : 'Microsoft authentication failed',
      });
      onError?.(error as Error);
      throw error;
    }
  }

  signOut(): void {
    this.tokenStorage.clearAllTokens();
  }

  isValidToken(tokenType: TokenType = ONEDRIVE_TOKEN_TYPE.FILE_ACCESS): boolean {
    return this.tokenStorage.isValidToken(tokenType);
  }

  isValidPickerToken(): boolean {
    return this.tokenStorage.isValidToken(ONEDRIVE_TOKEN_TYPE.PICKER);
  }

  isValidFileAccessToken(): boolean {
    return this.tokenStorage.isValidToken(ONEDRIVE_TOKEN_TYPE.FILE_ACCESS);
  }

  isSignedIn(): boolean {
    return (
      !!this.getStoredTokenData(ONEDRIVE_TOKEN_TYPE.FILE_ACCESS) &&
      this.tokenStorage.isValidToken(ONEDRIVE_TOKEN_TYPE.FILE_ACCESS)
    );
  }

  private async authenticateWithBrowserWindow(options: {
    prompt?: string;
    loginHint?: string;
    scopes?: string[];
    authority?: string;
  }): Promise<MicrosoftTokenData | null> {
    if (!window.electronAPI?.authenticateWithMicrosoft) {
      throw new Error('Electron API not available or authenticateWithMicrosoft method missing');
    }

    try {
      const tokenData: MicrosoftTokenData | null = await window.electronAPI.authenticateWithMicrosoft(options);

      if (!tokenData) {
        return null;
      }

      if (!tokenData.email && tokenData.access_token) {
        try {
          const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          });

          if (response.ok) {
            const userData = (await response.json()) as { mail?: string; userPrincipalName?: string };
            tokenData.email = userData.mail || userData.userPrincipalName || '';
          }
        } catch (error) {
          logger.logError({
            context: this.authenticateWithBrowserWindow.name,
            reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return tokenData;
    } catch (error: unknown) {
      logger.logError({
        context: this.authenticateWithBrowserWindow.name,
        reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
        message: (error as Error).message,
      });
      throw error;
    }
  }

  private storeTokenData(tokenData: MicrosoftTokenData, tokenType: TokenType = ONEDRIVE_TOKEN_TYPE.FILE_ACCESS): void {
    this.tokenStorage.storeToken(
      tokenData.access_token,
      tokenData.email || '',
      tokenData.oid || '',
      tokenData.scope || '',
      tokenData.cid || '',
      tokenType
    );
  }

  storePickerToken(tokenData: MicrosoftTokenData): void {
    this.storeTokenData(tokenData, ONEDRIVE_TOKEN_TYPE.PICKER);
  }

  storeFileAccessToken(tokenData: MicrosoftTokenData): void {
    this.storeTokenData(tokenData, ONEDRIVE_TOKEN_TYPE.FILE_ACCESS);
  }

  private convertStoredToTokenData(stored: import('./TokenStorageService').TokenData): MicrosoftTokenData {
    return {
      access_token: stored.accessToken,
      cid: stored.cid || extractCidFromOid(stored.oid),
      scope: stored.scope || '',
      email: stored.email,
      oid: stored.oid,
    };
  }

  private getStoredTokenData(tokenType: TokenType = ONEDRIVE_TOKEN_TYPE.FILE_ACCESS): MicrosoftTokenData | null {
    const stored = this.tokenStorage.getToken(tokenType);
    if (!stored) {
      return null;
    }

    return this.convertStoredToTokenData(stored);
  }

  getStoredPickerToken(): MicrosoftTokenData | null {
    return this.getStoredTokenData(ONEDRIVE_TOKEN_TYPE.PICKER);
  }

  getStoredFileAccessToken(): MicrosoftTokenData | null {
    return this.getStoredTokenData(ONEDRIVE_TOKEN_TYPE.FILE_ACCESS);
  }
}

export const electronMicrosoftServices = new ElectronMicrosoftServices();
