import { USER_BLACK_LIST } from 'constants/customConstant';
import { documentStorage } from 'constants/documentConstants';
import { general } from 'constants/documentType';
import { DIVIDER_ID } from 'constants/lumin-common';
import toolsName from 'constants/toolsName';

export default ({ items, currentDocument, email }) => {
  let activeHeaderItems = [...items];
  const isExternalDriveDocument = [documentStorage.dropbox, documentStorage.onedrive].includes(currentDocument.service);
  const isNotPdfDocument = currentDocument.mimeType !== general.PDF;
  const specialTools = [toolsName.REDACTION, toolsName.CONTENT_EDIT];
  if (isExternalDriveDocument || isNotPdfDocument) {
    activeHeaderItems = items.filter((item) => !specialTools.includes(item?.toolName) && item?.id !== DIVIDER_ID.THREE);
  }
  const userCannotUseEditPDF = USER_BLACK_LIST.EDIT_PDF.includes(email);
  if (userCannotUseEditPDF) {
    activeHeaderItems = items.filter(
      (item) => item?.toolName !== toolsName.CONTENT_EDIT && item?.id !== DIVIDER_ID.THREE
    );
  }
  return activeHeaderItems;
};
