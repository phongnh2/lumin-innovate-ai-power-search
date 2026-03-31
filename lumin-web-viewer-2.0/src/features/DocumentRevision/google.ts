/* eslint-disable class-methods-use-this */

import { handleUploadGoogleDrive } from 'luminComponents/HeaderLumin/utils';

import googleServices from 'services/googleServices';

import { ErrorCode, LOGGER } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { DocumentRevisionBase } from './base';
import {
  IDocumentRestore,
  IDocumentRevision,
  IDocumentVersioningLoggerError,
  IGetListRevision,
  IRestoreGoogleFileInfo,
} from './interface';

export class GoogleDocumentRevision extends DocumentRevisionBase {
  sortByModifiedTime(revisions: IDocumentRevision[]) {
    return revisions.sort(
      (a: IDocumentRevision, b: IDocumentRevision) =>
        new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
    );
  }

  async getList({ fileId }: IGetListRevision) {
    try {
      const { revisions } = await googleServices.getFileRevisions(fileId);
      const formatedRevisions = revisions.map((item) => ({
        ...item,
        _id: item.id,
      }));

      return this.sortByModifiedTime(formatedRevisions);
    } catch (error: unknown) {
      this.loggerError({ error: error as string });
      return [];
    }
  }

  async restore(restoredDoc: IDocumentRestore) {
    try {
      const file = await googleServices.getPreviousFileVersionContent(
        restoredDoc.currentDocument,
        restoredDoc.versionId
      );

      if (!file) {
        return {
          error: ErrorCode.Common.NOT_FOUND,
        };
      }

      const fileInfo: IRestoreGoogleFileInfo = {
        fileId: restoredDoc.currentDocument.remoteId,
        fileMetadata: {
          name: `${file.name}.${file.type}`,
          mimeType: file.type,
        },
        fileData: file,
      };

      await handleUploadGoogleDrive({
        isOverrideMode: true,
        handleInternalStoragePermission: restoredDoc.handleInternalStoragePermission,
        fileInfo,
      });
      return {
        success: true,
      };
    } catch (error: unknown) {
      this.loggerError({ error: error as string });
      return {
        success: false,
      };
    }
  }

  getFileId(currentDocument: IDocumentBase) {
    return currentDocument.remoteId;
  }

  async getFileDataByVersionId({ versionId, currentDocument }: { versionId: string; currentDocument: IDocumentBase }) {
    try {
      const file = await googleServices.getPreviousFileVersionContent(currentDocument, versionId);

      return {
        file,
        annotationData: '',
      };
    } catch (error: unknown) {
      this.loggerError({ error: error as string });
      return null;
    }
  }

  loggerError(error: Pick<IDocumentVersioningLoggerError, 'error'>) {
    super.loggerError({
      reason: LOGGER.Service.GOOGLE_REVISION_API_ERROR,
      error: error.error,
    });
  }
}
