const extensions = {
  PNG: 'png',
  JPG: 'jpg',
  JPEG: 'jpeg',
  PDF: 'pdf',
  DOCX: 'docx',
  XLSX: 'xlsx',
  PPTX: 'pptx',
} as const;

const general = {
  PDF: 'application/pdf',
  HTML: 'text/html',
  ZIP: 'application/zip',
};

const images = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  JPG: 'image/jpg',
};

const office = {
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PPT: 'application/vnd.ms-powerpoint',
  CSV: 'text/csv',
};

const googleOffice = {
  DOCS: 'application/vnd.google-apps.document',
  SPREADSHEET: 'application/vnd.google-apps.spreadsheet',
};

const DocumentPreFix = {
  SYSTEM_FILE_PREFIX_ID: 'system-',
};

const Document = {
  VALID_MONGO_ID_LENGTH: 24,
};

const MimeType = {
  XML: 'application/xml',
};

const dropboxType = {
  PNG: '.png',
  JPG: '.jpg',
  JPEG: '.jpeg',
  PDF: '.pdf',
  DOCX: '.docx',
  XLSX: '.xlsx',
  PPTX: '.pptx',
};

const oneDriveType = {
  PNG: '.png',
  JPG: '.jpg',
  JPEG: '.jpeg',
  PDF: '.pdf',
  DOCX: '.docx',
  XLSX: '.xlsx',
  PPTX: '.pptx',
};

const acceptedMimeType = [
  general.PDF,
  images.PNG,
  images.JPG,
  images.JPEG,
  office.DOCX,
  office.XLSX,
  office.PPTX,
  office.DOC,
  office.PPT,
  office.XLS,
];

export {
  extensions,
  general,
  images,
  office,
  googleOffice,
  dropboxType,
  DocumentPreFix,
  Document,
  oneDriveType,
  MimeType,
  acceptedMimeType
};
