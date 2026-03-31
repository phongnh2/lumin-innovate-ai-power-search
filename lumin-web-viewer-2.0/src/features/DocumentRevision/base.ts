import logger from 'helpers/logger';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { IDocumentRestore, IDocumentRevision, IGetListRevision, IDocumentVersioningLoggerError } from './interface';

export abstract class DocumentRevisionBase {
  abstract getList({ fileId, limit }: IGetListRevision): Promise<IDocumentRevision[]>;

  abstract restore(restoredDoc: IDocumentRestore): Promise<{
    error?: string;
    success?: boolean;
  }>;

  abstract getFileId(currentDocument: IDocumentBase): string;

  abstract getFileDataByVersionId({
    versionId,
    currentDocument,
  }: {
    versionId: string;
    currentDocument: IDocumentBase;
  }): Promise<{ file: File; annotationData: string } | { error: string } | null>;

  // eslint-disable-next-line class-methods-use-this
  loggerError(error: IDocumentVersioningLoggerError) {
    logger.logError({
      reason: error.reason,
      error: error.error,
    });
  }
}
