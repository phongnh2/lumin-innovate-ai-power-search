import { IDocumentRevision } from 'features/DocumentRevision/interface';

import { Nullable } from 'interfaces/common';
import { IDocumentBase } from 'interfaces/document/document.interface';

import { DriveFileInfo, GoogleImplicitAccessToken } from './types/googleServices.types';

declare namespace googleServices {
  export function hasGrantedScope(scope: string): boolean;

  export function signIn(params: {
    callback?: () => void;
    scope?: string[];
    onError?: (e: unknown) => void;
    prompt?: string;
  }): Promise<void>;

  export function removeOAuth2Token(): void;

  export function getCurrentRemoteEmail(): Promise<string>;

  export function isSignedIn(): boolean;

  export function setOAuth2Token(
    {
      access_token,
      scope,
      email,
      userRemoteId,
    }: {
      access_token: string;
      scope: string;
      email: string;
      userRemoteId: string;
    },
    expireAt: number
  ): void;

  export function implicitSignIn(params: {
    callback?: (data?: unknown) => void;
    scope?: string[];
    onError?: (error?: unknown) => void;
    prompt?: string;
    excludeScopes?: string[];
    loginHint?: string;
  }): Promise<void>;

  export function removeImplicitAccessToken(): void;

  export function getFileInfo(fileId: string, fields?: string, from?: string): Promise<DriveFileInfo>;

  export function getImplicitAccessToken(): Nullable<GoogleImplicitAccessToken>;

  export function checkAuthorizedUserHasPopularDomain(): Promise<boolean>;

  export function checkGoogleAccessTokenExpired(): boolean;

  export function getAccessTokenEmail(): string;

  export function syncUpAccessToken(): void;

  export function getFileRevisions(fileId: string): Promise<{
    revisions: Omit<IDocumentRevision, '_id'> &
      {
        id: string;
      }[];
  }>;

  export function getPreviousFileVersionContent(document: IDocumentBase, versionId: string): Promise<File>;

  export function isValidToken(): Promise<boolean>;

  export function uploadFileToDrive(data: {
    fileId: string;
    fileMetadata: Record<string, unknown>;
    fileData: Blob;
  }): Promise<void>;

  export function downloadFile(fileId: string, fileName: string): Promise<File>;

  export function getUserSpaceInfo(): Promise<{
    storageQuota: {
      limit: string;
      usage: string;
      usageInDrive: string;
      usageInDriveTrash: string;
    };
  }>;

  function getAccessTokenInfo(accessToken: string): Promise<{
    email: string;
    scope: string;
    sub: string;
  }>;

  function injectAccessTokenInfo(
    accessToken: string,
    scope: string,
    tokenInfo: {
      email: string;
      scope: string;
      userRemoteId: string;
    }
  ): Promise<{
    scope: string;
    access_token: string;
    email: string;
  }>;
}

export default googleServices;
