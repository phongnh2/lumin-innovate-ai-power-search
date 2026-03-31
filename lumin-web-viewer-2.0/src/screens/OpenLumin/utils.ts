import { v4 } from 'uuid';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';

import checkDocumentType from 'utils/checkDocumentType';

import { DocumentRole, DOCUMENT_TYPE, DocumentFromSourceEnum } from 'constants/documentConstants';
import { office, general, images } from 'constants/documentType';
import { STORAGE_TYPE } from 'constants/lumin-common';

import { DocumentSystemFile } from 'interfaces/document/document.interface';

import { PLATFORM, ERROR_MESSAGES } from './constants';
import { CreateDocumentParams, ValidateAndProcessFileParams } from './types';

export const getMimeType = (fileName: string, fileType: string): string => {
  const ext = fileName.split('.').slice(-1)[0]?.toUpperCase();
  return (
    fileType ||
    office[ext as keyof typeof office] ||
    general[ext as keyof typeof general] ||
    images[ext as keyof typeof images]
  );
};

export const createDocument = ({
  fileData,
  currentUser,
  platform = PLATFORM.PWA,
}: CreateDocumentParams): DocumentSystemFile => {
  const fileId = `system-${v4()}`;
  const now = new Date().getTime();

  return {
    _id: fileId,
    name: fileData.name,
    size: fileData.size,
    isPersonal: true,
    mimeType: fileData.mimeType,
    createdAt: now,
    ownerName: currentUser?.name,
    roleOfDocument: DocumentRole.OWNER,
    service: STORAGE_TYPE.SYSTEM,
    documentType: DOCUMENT_TYPE.PERSONAL,
    thumbnail: '',
    lastAccess: fileData.lastModified || now,
    isStarred: false,
    fromSource: DocumentFromSourceEnum.USER_UPLOAD,
    metadata: {},
    platform,
    ...fileData.platformSpecificData,
  };
};

export const validateAndProcessFile = async ({
  fileData,
  currentUser,
  platform,
}: ValidateAndProcessFileParams): Promise<string> => {
  const mimeType = getMimeType(fileData.name, fileData.mimeType);

  if (!checkDocumentType(mimeType)) {
    const fileExtension = fileData.name.split('.').slice(-1)[0];
    throw new Error(`${ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE}: ${fileExtension}`);
  }

  const document = createDocument({ fileData: { ...fileData, mimeType }, currentUser, platform });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const existedFile = (await systemFileHandler.findSystemDocument(document)) as DocumentSystemFile;

  if (!existedFile) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await systemFileHandler.insert([document]);
  }

  return existedFile?._id || document._id;
};
