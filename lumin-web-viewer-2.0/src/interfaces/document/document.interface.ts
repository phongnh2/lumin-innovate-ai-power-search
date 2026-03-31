// FIXME: need to refactor later
import { PlatformType } from 'screens/OpenLumin/constants';

import { COMPRESS_QUALITY } from 'features/CompressPdf/constants';
import { DocumentActionCapabilities } from 'features/DocumentActionPermission';

import { DocumentService } from 'constants/document.enum';
import {
  DOCUMENT_OFFLINE_STATUS,
  DOCUMENT_TYPE,
  DocumentFromSourceEnum,
  DocumentRole,
} from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';

import { IPayment } from 'interfaces/payment/payment.interface';

export interface IDocumentShareSeting {
  link: string;
  linkType: 'ANYONE' | 'INVITED';
  permission: 'VIEWER' | 'EDITOR' | 'SPECTATOR' | 'SHARER';
}

interface IMetadata {
  hasOutlines: boolean;
  hasMerged: boolean;
  hasAppliedOCR: boolean;
}

export interface IBelongsTo {
  type: string;
  workspaceId: string;
  location: {
    _id: string;
    ownedOrgId: string;
    name: string;
    url: string;
  };
}

export interface IAnnotation {
  xfdf: string;
  annotationId: string;
}

export interface IFormField {
  name: string;
  value: string;
  xfdf: string;
  isDeleted: boolean;
  isInternal: boolean;
}

export interface ISharedPermissionInfo {
  type: string;
  total: number;
  organizationName: string;
  teamName: string;
}

export type Storage = typeof STORAGE_TYPE[keyof typeof STORAGE_TYPE];

export interface IDocumentBase {
  _id: string;
  clientId: string;
  createdAt?: string;
  documentType: 'PERSONAL' | 'ORGANIZATION' | 'ORGANIZATION_TEAM';
  folderId?: string;
  isOverTimeLimit?: boolean;
  isPersonal: boolean;
  lastAccess?: string;
  mimeType: string;
  name: string;
  ownerAvatarRemoteId: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerOfTeamDocument?: string;
  remoteEmail: string;
  remoteId: string;
  roleOfDocument: 'owner' | 'sharer' | 'editor' | 'viewer' | 'spectator' | 'guest';
  service: 's3' | 'google' | 'dropbox' | 'onedrive' | 'system' | 'caching';
  shareSetting: IDocumentShareSeting;
  size: number;
  etag?: string;
  thumbnail: string;
  version?: number;
  documentReference: {
    accountableBy: string;
    data: {
      _id: string;
      domain: string;
      payment: IPayment;
      userRole: string;
    };
  };
  isShared?: boolean;
  isGuest?: boolean;
  belongsTo?: IBelongsTo;
  newAnnotations?: IAnnotation[];
  file?: string;
  fileHandle?: FileSystemFileHandle;
  thumbnailRemoteId?: string;
  backupInfo?: {
    createdAt: string;
    restoreOriginalPermission: string;
  };
  signedUrl?: string;
  isOfflineValid?: boolean;
  isSystemFile?: boolean;
  unsaved?: boolean;
  manipulationStep?: string;
  premiumToolsInfo?: {
    maximumNumberSignature: number;
    documentSummarization: {
      enabled: boolean;
      maxPages: number;
    };
    externalSync: {
      oneDrive: boolean;
    };
    documentVersioning: {
      quantity: number;
      maximumSaveTime: number;
      maximumSaveTimeUnit: string;
    };
    compressPdf: {
      enabled: boolean;
      fileSizeLimitInMB: number;
      availableCompressQuality: COMPRESS_QUALITY[];
    };
    signedResponse?: string;
  };
  sharedPermissionInfo?: ISharedPermissionInfo;
  metadata?: IMetadata;
  externalStorageAttributes?: ExternalStorageAttributes;
  /**
   * @description
   * Indicates whether this document was opened as a temporary edit from a Lumin Template
   */
  temporaryEdit?: boolean;
  listUserStar: string[];
  newUpload?: boolean;
  offlineStatus?: typeof DOCUMENT_OFFLINE_STATUS[keyof typeof DOCUMENT_OFFLINE_STATUS];
  /**
   * Show highlight for found document in file location feature
   */
  highlightFoundDocument?: boolean;
  folderData?: FolderPublicInfo;
  status?: {
    isSyncing?: boolean;
  };
  enableGoogleSync?: boolean;
  imageSignedUrls?: Record<string, string>;
  isAnonymousDocument?: boolean;
  fields?: IFormField[];
  lastModify?: string;
  platform?: PlatformType;
  platformSpecificData?: {
    filePath?: string;
  };
  capabilities?: DocumentActionCapabilities;
}

export interface DocumentTemplate extends IDocumentBase {
  kind: 'TEMPLATE';
  isTemplateViewer?: boolean;
}

export interface OneDriveStorageAttributes {
  driveId: string;
}

export type ExternalStorageAttributes = OneDriveStorageAttributes;

export type HitDocStackModal = {
  type: string;
  title: string;
  message: string;
  confirmButtonTitle: string;
  cancelButtonTitle?: string;
  useReskinModal?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  titleCentered?: boolean;
  confirmButtonProps?: Record<string, any>;
};

export type InfoDocumentExisted = {
  documentId: string;
  organization: {
    _id: string;
    url: string;
    name: string;
  };
  folder: {
    name: string;
    _id: string;
  };
};

export type DocumentImportParams = {
  remoteId: string;
  name: string;
  size: number;
  mimeType: string;
  service: DocumentService;
  remoteEmail?: string;
  externalStorageAttributes?: ExternalStorageAttributes;
};

export type TDocumentOutline = {
  _id?: string;
  parentId: string | null;
  pathId: string;
  name: string;
  level: number;
  pageNumber?: number;
  verticalOffset?: number;
  horizontalOffset?: number;
  hasChildren: boolean;
};

export type TNestedOutline = TDocumentOutline & {
  children: TNestedOutline[];
};

export interface DocumentSystemFile {
  _id: string;
  fileHandle?: FileSystemFileHandle;
  name: string;
  size: number;
  isPersonal: boolean;
  mimeType: string;
  createdAt: number;
  ownerName: string;
  roleOfDocument: typeof DocumentRole[keyof typeof DocumentRole];
  service: typeof STORAGE_TYPE[keyof typeof STORAGE_TYPE];
  documentType: typeof DOCUMENT_TYPE[keyof typeof DOCUMENT_TYPE];
  thumbnail: string;
  lastAccess: number;
  isStarred: boolean;
  fromSource: typeof DocumentFromSourceEnum[keyof typeof DocumentFromSourceEnum];
  metadata: Record<string, unknown>;
  platform: PlatformType;
}

export interface FolderPublicInfo {
  _id: string;
  name: string;
  canOpen: boolean;
}
