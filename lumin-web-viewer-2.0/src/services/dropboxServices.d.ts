import { DropboxFileInfo } from './types/dropboxService.types';

declare namespace dropboxServices {
  export function isSignedIn(): boolean;

  export function requestPermission(): Window | { closed: boolean; close: () => void } | null;

  export function getFileMetaData(fileId: string): Promise<any>;

  export function getUserSpaceInfo(): Promise<{
    data: {
      used: number;
      allocation: {
        allocated: string;
      };
    };
  }>;

  export function uploadFileToDropbox(): Promise<{
    data: DropboxFileInfo;
  }>;
}

export default dropboxServices;
