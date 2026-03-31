import { userServices } from 'services';

import { ANNOTATION_ACTION } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';

export default async (listOtherAuthor: string[], currentDocument: IDocumentBase): Promise<void> => {
  await userServices.confirmUpdateAnnotation({
    authorEmails: [...listOtherAuthor],
    documentId: currentDocument._id,
    action: ANNOTATION_ACTION.MODIFY,
    remoteId: currentDocument.remoteId || '',
  });
};
