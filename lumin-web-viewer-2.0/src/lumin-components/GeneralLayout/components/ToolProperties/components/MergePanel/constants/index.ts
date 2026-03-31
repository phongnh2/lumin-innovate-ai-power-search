import { ModalName } from 'utils/Factory/EventCollection/constants/ModalName';
import { ModalPurpose } from 'utils/Factory/EventCollection/constants/ModalPurpose';

import { MAX_SIZE_MERGE_DOCUMENT } from 'constants/documentConstants';
import { images, general } from 'constants/documentType';

export const SELECT_VALUE = {
  AFTER: 'AFTER',
  BEFORE: 'BEFORE',
  SPECIFIC: 'SPECIFIC',
};

export const SUPPORTED_FILE_MERGE = [general.PDF, images.PNG, images.JPG, images.JPEG];

// unit is bytes
export const MEGABYTES_TO_BYTES = 1024 * 1024;

export const MAX_FILE_SIZE = MEGABYTES_TO_BYTES * MAX_SIZE_MERGE_DOCUMENT.PAID;

export const MAX_FILE_SIZE_FREE_USER_MERGE = MEGABYTES_TO_BYTES * MAX_SIZE_MERGE_DOCUMENT.FREE;

export const ERROR_MESSAGE_TYPE = {
  PDF_SIZE: 'viewer.mergePagePanel.pdfSize',
  PDF_UNSUPPORT_TYPE: 'viewer.mergePagePanel.mustUpload',
  OVER_TOTAL_PAGES: 'viewer.mergePagePanel.pleaseSelectValidPageNum',
  INVALID_PAGE_POSITION: 'viewer.mergePagePanel.pleaseEnterValidPageNum',
  INVALID_PAGE_INSERT: 'viewer.mergePagePanel.pleaseEnterComma',
  DEFAULT: 'viewer.mergePagePanel.default',
};

export const OTHER_SOURCE_FILE = {
  GOOGLE: 'google',
  LOCAL: 'local',
};

// eslint-disable-next-line no-useless-escape
export const rangeRegex = /^\d+(?:-\d+)?(?:,\h*\d+(?:-\d+)?)*$/g;

export const MERGE_TITLE = 'viewer.leftPanelEditMode.merge';

export const MERGE_EVENTS = {
  ADD_MORE_FILES_TO_MERGE: 'addMoreFilesToMerge',
  REMOVE_UPLOAD_FILES_IN_MERGE: 'removeUploadFilesInMerge',
  CANCEL_MERGE: 'cancelMerge',
  START_TO_MERGE: 'startToMerge',
  CANCEL_MERGE_PROGRESS: 'cancelMergeProcess',
};

export const MERGE_EVENTS_PURPOSE = {
  [MERGE_EVENTS.ADD_MORE_FILES_TO_MERGE]: 'Add more files to merge documents',
  [MERGE_EVENTS.REMOVE_UPLOAD_FILES_IN_MERGE]: 'Remove upload files in merge',
  [MERGE_EVENTS.CANCEL_MERGE]: 'Cancel merge documents',
  [MERGE_EVENTS.START_TO_MERGE]: 'Start to merge documents',
  [MERGE_EVENTS.CANCEL_MERGE_PROGRESS]: 'Cancel merge documents process',
};

export const MERGE_CHECKBOX_EVENT = {
  TYPE: 'checkboxUpdated',
  PARAMS: {
    checkboxName: 'insertAllPages',
    checkboxPurpose: 'Insert all pages to merge',
  },
};

export const MERGE_MODAL_EVENT_PARAMS = {
  modalName: ModalName.COMFIRM_MERGE,
  modalPurpose: ModalPurpose[ModalName.COMFIRM_MERGE],
};
