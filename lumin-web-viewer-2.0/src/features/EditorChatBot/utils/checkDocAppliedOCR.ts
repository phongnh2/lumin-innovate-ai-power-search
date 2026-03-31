import { getFirstPageExistText } from 'utils/getFirstPageExistText';

import { IDocumentBase } from 'interfaces/document/document.interface';

export const isNeedApplyOCR = async (currentDocument: IDocumentBase) => {
  const hasAppliedOCR = currentDocument?.metadata?.hasAppliedOCR;
  const firstPageExistText = await getFirstPageExistText();

  return !firstPageExistText && !hasAppliedOCR;
};
