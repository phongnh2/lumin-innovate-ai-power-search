export enum MIME_TYPE {
    PDF = 'application/pdf',
    XML = 'application/xml',
}

const PDF_MIME_TYPE = [
  MIME_TYPE.PDF as string,
];

const IMAGE_MIME_TYPE = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

const OFFICE_MIME_TYPE = [
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.ms-powerpoint', // .ppt
];

const SUPPORTED_MIME_TYPE = [
  ...PDF_MIME_TYPE,
  ...IMAGE_MIME_TYPE,
  ...OFFICE_MIME_TYPE,
];

export {
  PDF_MIME_TYPE,
  IMAGE_MIME_TYPE,
  SUPPORTED_MIME_TYPE,
  OFFICE_MIME_TYPE,
};

export const DEFAULT_MAX_DOCUMENT_TEMPLATE_QUOTA = 1000;
