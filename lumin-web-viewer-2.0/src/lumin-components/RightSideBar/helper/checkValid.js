import { STORAGE_TYPE } from 'constants/lumin-common';

export function shouldShowShareDocumentAndCopyLinkTool(currentDocument) {
  return (
    currentDocument && [STORAGE_TYPE.SYSTEM, STORAGE_TYPE.LOCAL].every((storage) => storage !== currentDocument.service)
  );
}
