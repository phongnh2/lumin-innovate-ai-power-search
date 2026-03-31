import { Types } from 'mongoose';

import {
  DocumentOwnerTypeEnum, DocumentRoleEnum, DocumentWorkspace, DocumentFromSourceEnum, DocumentStorageEnum,
  DocumentIndexingStatusEnum,
  DocumentKindEnum,
} from 'Document/document.enum';
import { DocumentFilterInput, DocumentQueryInput, DocumentRole } from 'graphql.schema';
import { User } from 'User/interfaces/user.interface';

import { ExternalStorageAttributes } from './externalStorage.interface';

export interface IDocumentModel {
  ownerId: string;
  name: string;
  remoteId: string;
  remoteEmail: string;
  enableGoogleSync: boolean;
  mimeType: string;
  service: string;
  size: number;
  ownerName: string;
  manipulationStep: string;
  isPersonal: boolean;
  shareSetting: any;
  roleOfDocument: string;
  thumbnail: string;
  bookmarks: string;
  createdAt?: string;
  lastAccess?: string;
  isOverTimeLimit?: boolean;
  folderId?: string;
  version?: number;
  temporaryRemoteId?: string;
  etag?: string;
  fromSource: DocumentFromSourceEnum,
  lastModifiedBy?: string;
  lastModify?: string;
  listUserStar?: string[],
  metadata?: {
    hasAppliedOCR: boolean,
    hasMerged: boolean,
    hasOutlines: boolean,
    indexingStatus: DocumentIndexingStatusEnum,
  }
  externalStorageAttributes?: ExternalStorageAttributes;
  kind?: DocumentKindEnum;
}

export interface IDocument extends IDocumentModel {
  _id: string;
}

export interface IDocumentFormModel {
  name: string;
  size: number;
  categories: string[];
  remoteId: string;
  mimeType: string;
  thumbnail: string;
  rateAvg: number;
  rateCount: number;
  prismicId?: string;
  url?: string;
}

export interface IDocumentForm extends IDocumentFormModel {
  _id: string;
}

export interface IDocumentPermissionModel {
  refId: string;
  documentId: string;
  role: string;
  groupPermissions?: any;
  defaultPermission?: { member: string };
  workspace: {
    refId: string;
    type: DocumentWorkspace;
  }
  documentKind?: DocumentKindEnum;
}

export interface IDocumentPermission extends IDocumentPermissionModel {
  _id: string;
}

export interface IAnnotationModel {
  xfdf: string;
  annotationId: string;
  documentId: string;
  lastModified?: any;
  order?: number;
  /**
   * @deprecated We don't need this field anymore, the annotation will be deleted permanently instead of soft delete
   */
  isDeleted?: boolean;
  pageIndex: number;
}

export interface IAnnotation extends IAnnotationModel {
  _id: string;
}

export interface IManipulationModel {
  documentId: string;
  refId: string,
  type?: string,
  option?: string,
  createdAt?: Date;
}

export interface IManipulation extends IManipulationModel {
  _id: string;
}

export interface IDocumentSharedNonUserModel {
  documentId: string;
  email: string;
  role: string;
  message: string;
  type: string;
  sharerId: string;
  teamId?: string;
}

export interface IDocumentSharedNonUser extends IDocumentSharedNonUserModel {
  _id: string;
}
export interface IDocumentRequestAccessModel {
  documentId: string;
  requesterId: string;
  documentRole: DocumentRoleEnum;
  createdAt: Date;
}

export interface IDocumentRequestAccess extends IDocumentRequestAccessModel {
  _id: string;
}
export interface ShareDocumentToLuminUserInput {
  emails: string[];
  document: Partial<IDocument>;
  role: string;
  sharer: User;
  message: string;
}

export interface CreateNonLuminSharedInput {
  documentId: string;
  emails: string[];
  role: string;
  sharerId: string;
  message: string;
  teamId?: string;
}

export interface IDocumentOwner extends IDocument {
  owner: Partial<User>
}

export interface IShareDocumentInvitation {
  _id: any;
  email: string;
  hasPermission: boolean;
  permissionType: DocumentOwnerTypeEnum;
  role: DocumentRoleEnum | null;
  refId: string | null;
  membershipRole?: string;
}

export interface IDocumentBackupInfoModel {
  documentId: string;
  remoteId: string;
  orgId: string;
  createdAt?: Date;
}

export interface IDocumentBackupInfo extends IDocumentBackupInfoModel {
  _id: string;
}

export interface IDocumentImageModel {
  documentId: string;
  remoteId: string;
}
export interface IDocumentImage extends IDocumentImageModel {
  _id: string;
}

export interface IUpdateManyDocumentRemoteEmail{
  conditions: {
    remoteEmails: string[];
    ownerIds: string[];
  },
  updatedObj: {
    newRemoteEmails: string[];
  }
}

export interface ISharer {
  email: string;
  name?: string;
  avatar?: string;
}

export interface IDocumentDriveMetadataModel {
  remoteId: string;
  documentId: Types.ObjectId;
  sharers: ISharer[];
}

export interface IDocumentDriveMetadata extends IDocumentDriveMetadataModel{
  _id: string;
}

export interface IDocumentFormFieldModel {
  documentId: string;
  type: string;
  name: string;
  widgetId: string;
  pageNumber: number;
  value?: string;
  xfdf?: string;
  isDeleted?: boolean;
  isInternal?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDocumentOutlineModel {
  documentId: string;
  name?: string;
  parentId?: string;
  pathId: string;
  parentPath?: string;
  level?: number;
  lexicalRanking?: string;
  pageNumber?: number;
  verticalOffset?: number;
  horizontalOffset?: number;
  hasChildren?: boolean;
}

export interface IDocumentOutline extends IDocumentOutlineModel {
  _id: string
}

export interface IUpdateOutlineData {
  pathId: string;
  data: Partial<IDocumentOutlineModel>;
}

export interface IDocumentFormField extends IDocumentFormFieldModel {
  _id: string;
}

export interface IRecentDocument {
  _id: Types.ObjectId;
  openedAt: string;
}
export interface IRecentDocumentListModel {
  userId: string;
  organizationId: string;
  documents: IRecentDocument[];
}

export interface IRecentDocumentList extends IRecentDocumentListModel {
  _id: string;
}

export interface IPopulatedRecentDocument extends IDocument {
  openedAt: string;
}

export interface DocumentSharingQueueRequestPayload {
  sharingExecutionId: string;
  batchIndex: number;
  isChannelSharing: boolean;
  sharerId: string;
  documentId: string;
  emails: string[];
  role: DocumentRole;
  message?: string;
  isOverwritePermission?: boolean;
}

export interface IIndexDocumentMessage {
  remoteId: string;
  source: DocumentStorageEnum;
  userId: string;
  documentName: string;
  documentId: string;
  clientId: string;
  clientType: string;
  documentPermissionId: string;
  workspaceId: string;
  accessToken?: string;
  folderId?: string;
  origin?: string;
}

export type IIndexDocumentOperation = 'index' | 'update';

export interface IGetRecentDocumentListInput {
  query: DocumentQueryInput;
  filter: DocumentFilterInput;
}

export interface ProofingProgressMessage {
  taskId: string;
  step:
    | 'start_proofing'
    | 'upload_agreement'
    | 'apply_digital_signature'
    | 'finished'
    | 'failed';

  progress: number;
  data: { userId: string; documentId: string; contractId?: string };
}
