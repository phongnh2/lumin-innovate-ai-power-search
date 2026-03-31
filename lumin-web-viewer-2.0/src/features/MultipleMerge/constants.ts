import GoogleDriveLogo from 'assets/reskin/lumin-svgs/google.svg';

import { folderType } from 'constants/documentConstants';
import { extensions, general, images, office } from 'constants/documentType';

import {
  MultipleMergeStep,
  MultipleMergeStepType,
  SaveDestination,
  UploadDocumentError,
  UploadDocumentErrorType,
} from './enum';
import { SaveDestinationOptionType } from './types';

export const NEXT_STEP_MAPPER: Partial<Record<MultipleMergeStepType, MultipleMergeStepType>> = {
  [MultipleMergeStep.SELECT_DOCUMENTS]: MultipleMergeStep.MERGING_DOCUMENTS,
  [MultipleMergeStep.MERGING_DOCUMENTS]: MultipleMergeStep.SAVE_DOCUMENT,
};

export const getNextStep = (step: MultipleMergeStepType) => NEXT_STEP_MAPPER[step];

export const SAVE_DESTINATION_OPTIONS: SaveDestinationOptionType[] = [
  {
    type: SaveDestination.COMPUTER,
    contentKey: 'common.computer',
    icon: 'device-desktop-lg',
  },
  {
    type: SaveDestination.LUMIN,
    content: 'Lumin',
    icon: 'logo-lumin-lg',
    iconColor: 'var(--kiwi-colors-custom-brand-lumin-lumin-fixed)',
  },
  {
    type: SaveDestination.GOOGLE_DRIVE,
    content: 'Drive',
    imageSrc: GoogleDriveLogo,
  },
];

export const SAVE_DOCUMENT_FORMAT_LIST = [
  {
    type: extensions.PDF,
    contentKey: 'multipleMerge.pdfDocument',
    icon: 'file-type-pdf-lg',
  },
];

export const SUPPORTED_FILE_TYPES = [
  images.JPG,
  images.JPEG,
  images.PNG,
  general.PDF,
  office.XLSX,
  office.XLS,
  office.PPT,
  office.PPTX,
  office.DOCX,
  office.DOC,
];

export const MAX_DOCUMENTS_SIZE = 200 * 1000 * 1000;

export const MAX_MERGE_DOCUMENTS_SELECTION = 20;

const MULTIPLE_MERGE_FILE_ERROR_KEY = 'multipleMerge.fileError';

export const ERROR_CODE_MAPPER: Record<UploadDocumentErrorType, { key: string; reason?: string }> = {
  [UploadDocumentError.FAILED_TO_UPLOAD]: {
    key: MULTIPLE_MERGE_FILE_ERROR_KEY,
    reason: 'multipleMerge.failedToUpload',
  },
  [UploadDocumentError.FILE_INVALID_TYPE]: {
    key: MULTIPLE_MERGE_FILE_ERROR_KEY,
    reason: 'multipleMerge.unsupportedFileType',
  },
  [UploadDocumentError.FILE_ENCRYPTED]: {
    key: 'multipleMerge.fileEncryptedError',
    reason: 'multipleMerge.failedToUpload',
  },
  [UploadDocumentError.DOCUMENT_PERMISSION_DENIED]: {
    key: 'multipleMerge.permissionDenied',
  },
};

export const MULTIPLE_MERGE_SOURCE = {
  [folderType.INDIVIDUAL]: 'my documents',
  [folderType.ORGANIZATION]: 'circle documents',
  [folderType.TEAMS]: 'team documents',
};
