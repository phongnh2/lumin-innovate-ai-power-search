import { AWS_EVENTS } from 'constants/awsEvents';

import { EventCollection } from './EventCollection';

export class DocumentEventCollection extends EventCollection {
  deleteDocument({ LuminUserId, LuminFileId }: { LuminUserId: string; LuminFileId: string }) {
    return this.record({
      name: AWS_EVENTS.DELETE_DOCUMENT,
      attributes: {
        LuminUserId,
        LuminFileId,
      },
    });
  }

  downloadDocumentSuccess({
    fileType,
    savedLocation,
    flattenPdf,
  }: {
    fileType: string;
    savedLocation: string;
    flattenPdf?: boolean;
  }) {
    return this.record({
      name: AWS_EVENTS.DOWNLOAD_DOCUMENT_SUCCESS,
      attributes: {
        fileType,
        savedLocation,
        flattenPDF: flattenPdf,
      },
    });
  }

  documentSaving({ timeToSaveTheDocument, source }: { timeToSaveTheDocument: number; source: string }) {
    return this.record({
      name: AWS_EVENTS.SAVE_DOCUMENT,
      attributes: {
        timeToSaveTheDocument,
        source,
      },
    });
  }
}

export default new DocumentEventCollection();
