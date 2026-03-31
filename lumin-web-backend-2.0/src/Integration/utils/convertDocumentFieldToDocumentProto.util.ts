import { IDocument } from 'Document/interfaces/document.interface';

export const convertDocumentFieldToDocumentProto = (
  document: IDocument,
): {
  document_id: string;
  owner_id: string;
  last_modified_by: string;
  file_name: string;
  size: number;
  service: string;
  file_remote_id: string;
  mime_type: string;
  is_personal: boolean;
  thumbnail: string;
  enable_google_sync: boolean;
  created_at: string;
  last_modify: string;
  last_access: string;
  version: number;
  temporary_remote_id: string;
  from_source: string;
} => ({
  document_id: document._id,
  owner_id: document.ownerId,
  last_modified_by: document.lastModifiedBy,
  file_name: document.name,
  size: document.size,
  service: document.service,
  file_remote_id: document.remoteId,
  mime_type: document.mimeType,
  is_personal: document.isPersonal,
  thumbnail: document.thumbnail,
  enable_google_sync: document.enableGoogleSync,
  created_at: document.createdAt,
  last_modify: document.lastModify,
  last_access: document.lastAccess,
  version: document.version,
  temporary_remote_id: document.temporaryRemoteId,
  from_source: document.fromSource,
});
