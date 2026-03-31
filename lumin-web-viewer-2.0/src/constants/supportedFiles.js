import { images, general, office } from './documentType';

export const imageExtensions = [
  'jpg',
  'jpeg',
  'png',
];

export const supportedPDFExtensions = [
  'pdf',
  ...imageExtensions,
];

export const supportedExtensionsWhenMakeCopyToDrive = ['docx'];

export const supportedFileMimeType = [
  images.PNG,
  images.JPEG,
  images.JPG,
  general.PDF,
  office.DOCX,
  office.XLSX,
  office.PPTX,
  office.DOC,
  office.PPT,
  office.XLS,
];

export const supportedAvatarExtensions = ['image/jpg', 'image/jpeg', 'image/png'];
export const supportedOfficeExtensions = [
  'docx',
  'doc',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'md',
];
export const supportedClientOnlyExtensions = [
  'xod',
  ...supportedPDFExtensions,
  ...supportedOfficeExtensions,
];
export const supportedBlackboxExtensions = [
  ...supportedClientOnlyExtensions,
  'doc',
  'xls',
  'csv',
  'ppt',
  'htm',
  'html',
  'url',
  'xhtml',
  'tif',
  'tiff',
  'jp2',
  'txt',
  'rtf',
  'odf',
  'odt',
  'odg',
  'odp',
  'ods',
  'odp',
  'dwg',
  'dgn',
  'rvt',
  'rfa',
  'dxf',
  'dwf',
  'gif',
  'xltm',
  'xltx',
  'vsd',
  'vsdx',
  'xlsb',
  'xlt',
  'msg',
];
export const supportedExtensions = [
  ...supportedClientOnlyExtensions,
  ...supportedBlackboxExtensions,
];
