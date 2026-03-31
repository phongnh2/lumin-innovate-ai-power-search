import { Socket } from 'socket.io';

import { PageManipulation } from 'Common/constants/SocketConstants';

import { DocumentSyncStatus } from 'Document/enums/document.sync.enum';
import { ITeam } from 'Team/interfaces/team.interface';
import { User } from 'User/interfaces/user.interface';

export interface OnConnectionData {
  roomId: string,
  remoteId: string,
  user: User,
}

export interface AnnotationData {
  documentId: string,
  xfdf: string,
  annotationId: string,
  lastModified?: number,
  annotationType?: string
  order?: number,
  imageRemoteId?: string,
  /**
   * @deprecated We don't need this field anymore, the annotation will be deleted permanently instead of soft delete
   */
  isDeleted?: boolean,
  pageIndex?: number,
}

export interface DeleteTeamData {
  team: ITeam,
  documents: string[],
  members: string[],
  type: string,
  targetOrgId: string,
  targetOrgUrl: string,
}

export interface FormField {
  name?: string,
  type?: string,
  value?: string,
  xfdf?: string,
  isDeleted?: boolean,
  isInternal?: boolean,
}

export interface FormFieldChangedData {
  roomId: string;
  data: FormField;
  fieldName: string;
}

export interface IPageOperationOption {
  insertPages: number[];
  pagesRemove: number[];
  pagesToMove: number;
  insertBeforePage: number;
}

export interface ISendManipulationChangedData {
  option: IPageOperationOption;
  roomId: string;
  totalPages: number;
  type: PageManipulation;
}

export interface ISocket extends Socket {
  user?: User;
  _lumin_identity?: {
    identityId: string;
    sessionId: string;
    email: string;
  };
  anonymousUserId?: string;
  /**
   * @deprecated Use syncStatus instead
   */
  isSyncing?: boolean;
  isRequestFromMobile?: boolean;
  data: {
    document?: {
      id: string;
      remoteId: string;
    },
    user?: {
      _id: string;
      socketId: string;
      isActive: boolean;
      avatarRemoteId?: string;
    },
  };
  syncStatus?: {
    status: DocumentSyncStatus;
    documentId: string;
  };
}
