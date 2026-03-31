import { extractCidFromOid } from 'utils/microsoftAuthUtils';

import { LocalStorageKey } from 'constants/localStorageKey';

export interface TokenData {
  accessToken: string;
  email: string;
  expiredAt: string;
  oid: string;
  scope?: string;
  cid?: string;
}

export const ONEDRIVE_TOKEN_TYPE = {
  PICKER: 'picker',
  FILE_ACCESS: 'fileAccess',
} as const;

export type TokenType = typeof ONEDRIVE_TOKEN_TYPE[keyof typeof ONEDRIVE_TOKEN_TYPE];

export class TokenStorageService {
  private static readonly TOKEN_EXPIRY_MS = 3600 * 1000;

  private static readonly TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

  private getTokenKey(tokenType: TokenType): string {
    return tokenType === ONEDRIVE_TOKEN_TYPE.PICKER
      ? LocalStorageKey.ONEDRIVE_PICKER_TOKEN
      : LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN;
  }

  private getExpiryKey(tokenType: TokenType): string {
    return tokenType === ONEDRIVE_TOKEN_TYPE.PICKER
      ? LocalStorageKey.ONEDRIVE_PICKER_TOKEN_EXPIRY
      : LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN_EXPIRY;
  }

  storeToken(
    accessToken: string,
    email: string,
    oid: string,
    scope: string,
    cid: string,
    tokenType: TokenType,
    expiresInSeconds?: number
  ): void {
    const expiryMs = expiresInSeconds ? expiresInSeconds * 1000 : TokenStorageService.TOKEN_EXPIRY_MS;
    const expiredAt = Date.now() + expiryMs;

    const finalCid = cid || extractCidFromOid(oid);

    const tokenData: TokenData = {
      accessToken,
      email: email || '',
      expiredAt: expiredAt.toString(),
      oid: oid || '',
      scope: scope || '',
      cid: finalCid,
    };

    const tokenKey = this.getTokenKey(tokenType);
    const expiryKey = this.getExpiryKey(tokenType);

    localStorage.setItem(tokenKey, JSON.stringify(tokenData));
    localStorage.setItem(expiryKey, expiredAt.toString());
  }

  getToken(tokenType: TokenType): TokenData | null {
    const tokenKey = this.getTokenKey(tokenType);
    const tokenDataStr = localStorage.getItem(tokenKey);

    if (!tokenDataStr) {
      return null;
    }

    try {
      const tokenData = JSON.parse(tokenDataStr) as TokenData;

      if (!this.isValidToken(tokenType)) {
        this.clearToken(tokenType);
        return null;
      }

      return tokenData;
    } catch {
      this.clearToken(tokenType);
      return null;
    }
  }

  isValidToken(tokenType: TokenType): boolean {
    const expiryKey = this.getExpiryKey(tokenType);
    const expiresAt = localStorage.getItem(expiryKey);

    if (!expiresAt) {
      return false;
    }

    const expiryTime = parseInt(expiresAt, 10);
    if (isNaN(expiryTime)) {
      return false;
    }

    return Date.now() < expiryTime;
  }

  shouldRefreshToken(tokenType: TokenType): boolean {
    const expiryKey = this.getExpiryKey(tokenType);
    const expiresAt = localStorage.getItem(expiryKey);

    if (!expiresAt) {
      return true;
    }

    const expiryTime = parseInt(expiresAt, 10);
    if (isNaN(expiryTime)) {
      return true;
    }

    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    return timeUntilExpiry < TokenStorageService.TOKEN_REFRESH_BUFFER_MS;
  }

  clearToken(tokenType: TokenType): void {
    const tokenKey = this.getTokenKey(tokenType);
    const expiryKey = this.getExpiryKey(tokenType);

    localStorage.removeItem(tokenKey);
    localStorage.removeItem(expiryKey);
  }

  clearAllTokens(): void {
    this.clearToken(ONEDRIVE_TOKEN_TYPE.PICKER);
    this.clearToken(ONEDRIVE_TOKEN_TYPE.FILE_ACCESS);
  }

  hasRequiredScopes(requiredScopes: string[], tokenType: TokenType): boolean {
    if (!requiredScopes || requiredScopes.length === 0) {
      return true;
    }

    const tokenData = this.getToken(tokenType);
    if (!tokenData || !tokenData.scope) {
      return false;
    }

    const cachedScopes = new Set(tokenData.scope.toLowerCase().split(' ').filter(Boolean));
    const required = requiredScopes.map((s) => s.toLowerCase());

    return required.every((scope) => cachedScopes.has(scope));
  }
}

export const tokenStorageService = new TokenStorageService();
