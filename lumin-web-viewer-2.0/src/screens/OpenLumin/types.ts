import { IUser } from 'interfaces/user/user.interface';

import { PlatformType } from './constants';

export interface FileData {
  name: string;
  size: number;
  mimeType: string;
  lastModified: number;
  platformSpecificData: Record<string, unknown>;
}

export interface CreateDocumentParams {
  fileData: FileData;
  currentUser: IUser;
  platform: PlatformType;
}

export interface ValidateAndProcessFileParams {
  fileData: FileData;
  currentUser: IUser;
  platform: PlatformType;
}
