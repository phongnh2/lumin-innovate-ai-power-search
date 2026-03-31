import { office } from './documentType';

export const OfficeDocument = {
  DOC: 'DOC',
  DOCX: 'DOCX',
  XLS: 'XLS',
  XLSX: 'XLSX',
  PPTX: 'PPTX',
  PPT: 'PPT',
} as const;

export type OfficeDocumentType = typeof office[keyof typeof OfficeDocument];
