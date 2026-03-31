import { PdfAction } from 'features/EnableToolFromQueryParams/constants';

export const acceptedActionsFromFLP: string[] = [
  PdfAction.UPLOAD,
  PdfAction.READ,
  PdfAction.ANNOTATE,
  PdfAction.UNLOCK,
  PdfAction.MERGE,
  PdfAction.EDIT_TEXT,
];

export const actionManipulateDocumentFromFLP: string[] = [PdfAction.UNLOCK, PdfAction.MERGE, PdfAction.EDIT_TEXT];