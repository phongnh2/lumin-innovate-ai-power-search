/* eslint-disable class-methods-use-this */

import { parseISO } from 'date-fns';
import { AnyAction } from 'redux';

import axios from '@libs/axios';

import actions from 'actions';
import { store } from 'store';

import { documentServices } from 'services';
import { documentGraphServices } from 'services/graphServices';

import { handleTrackTimeDocumentSaving } from 'utils/calculateTimeTracking';
import errorUtils from 'utils/error';
import fileUtils from 'utils/file';
import { isPWAMode } from 'utils/recordUtil';

import { general } from 'constants/documentType';
import { ErrorCode, LOGGER } from 'constants/lumin-common';
import { AwsPresignUrlParams } from 'constants/UrlSearchParam';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { getDocumentVersionList, GetDocumentVersionListPayload, getVersionPresignedUrl } from './apis';
import { DocumentRevisionBase } from './base';
import { IDocumentRestore, IDocumentRevision, IDocumentVersioningLoggerError, IGetListRevision } from './interface';

const { dispatch } = store;

export class S3DocumentRevision extends DocumentRevisionBase {
  private tranformVersionListResult(versionList: GetDocumentVersionListPayload[]): IDocumentRevision[] {
    return versionList.map((version) => ({
      ...version,
      lastModifyingUser: {
        displayName: version.modifiedBy.name,
        photoLink: version.modifiedBy.avatar,
      },
      modifiedTime: version.createdAt,
      versionId: version.versionId,
      annotationSignedUrl: version.annotationSignedUrl,
      documentId: version.documentId,
    }));
  }

  async getList({ fileId }: IGetListRevision) {
    try {
      const { data: versionList = [] } = await getDocumentVersionList(fileId);
      return this.tranformVersionListResult(versionList);
    } catch (error: unknown) {
      this.loggerError({ error: error as string });
      return [];
    }
  }

  async restore({ versionId, currentDocument, password }: IDocumentRestore) {
    try {
      const { annotationData, file } = await this.getFileDataByVersionId({
        versionId,
        currentDocument,
      });
      if (!file) {
        return {
          success: false,
          error: ErrorCode.Common.NOT_FOUND,
        };
      }
      const pdfDoc = await window.Core.PDFNet.PDFDoc.createFromBuffer(await file.arrayBuffer());
      if (annotationData) {
        await pdfDoc.mergeXFDFString(annotationData);
      }
      const { name: documentName, _id: documentId, remoteId, thumbnailRemoteId } = currentDocument;
      if (password) {
        await pdfDoc.initStdSecurityHandler(password);
      }
      const arrayBuffer = await pdfDoc.saveMemoryBuffer(window.Core.PDFNet.SDFDoc.SaveOptions.e_linearized);
      const fileWithAnnots = new File([arrayBuffer], documentName, {
        type: general.PDF,
      });
      const thumbnailCanvases = await fileUtils.getThumbnailWithFile(fileWithAnnots, password);
      const thumbnailFile = await fileUtils.convertThumnailCanvasToFile(thumbnailCanvases, documentName);

      await handleTrackTimeDocumentSaving(
        documentServices.overrideDocumentToS3({
          documentId,
          file: fileWithAnnots,
          remoteId,
          thumbnailRemoteId,
          thumbnail: thumbnailFile,
          increaseVersion: true,
        }),
        currentDocument.service
      );
      return { success: true };
    } catch (error: unknown) {
      this.loggerError({ error });
      return { success: false };
    }
  }

  getFileId(currentDocument: IDocumentBase) {
    return currentDocument._id;
  }

  shouldRenewSignedUrl(signedUrl: string) {
    const signedUrlParams = new URLSearchParams(signedUrl);
    const expireIn = signedUrlParams.get(AwsPresignUrlParams.Expire);
    const createdAt = signedUrlParams.get(AwsPresignUrlParams.Date);

    if (!expireIn || !createdAt) {
      return true;
    }

    const expireInSeconds = parseInt(expireIn, 10);
    const createdAtDate = parseISO(createdAt);
    const expireAtDate = new Date(createdAtDate.getTime() + expireInSeconds * 1000);
    return new Date() > expireAtDate;
  }

  async getCurrentFile({ currentDocument }: { currentDocument: IDocumentBase }) {
    try {
      let { signedUrl } = currentDocument;
      if (this.shouldRenewSignedUrl(signedUrl)) {
        const {
          data: { document: newDocument },
        } = await documentGraphServices.getDocument({
          documentId: currentDocument._id,
          usePwa: isPWAMode(),
        });
        dispatch(actions.setCurrentDocument(newDocument) as AnyAction);
        signedUrl = newDocument.signedUrl;
      }

      const { data: arrayBuffer } = await axios.axios.get<ArrayBuffer>(signedUrl, {
        responseType: 'arraybuffer',
      });
      return new File([arrayBuffer], currentDocument.name, {
        type: general.PDF,
      });
    } catch (error: unknown) {
      this.loggerError({
        error,
      });
      return null;
    }
  }

  async getFileDataByVersionId({ versionId, currentDocument }: { versionId: string; currentDocument: IDocumentBase }) {
    try {
      const presignedUrl = await getVersionPresignedUrl(versionId);
      const fileContentPromise = axios.axios.get<ArrayBuffer>(presignedUrl.fileContentPresignedUrl, {
        responseType: 'arraybuffer',
      });

      const annotationContentPromise = presignedUrl.annotationPresignedUrl
        ? axios.axios.get<string>(presignedUrl.annotationPresignedUrl)
        : { data: '' };

      const [{ data: arrayBuffer }, { data: annotationData }] = await Promise.all([
        fileContentPromise,
        annotationContentPromise,
      ]);

      return {
        file: new File([new Blob([arrayBuffer])], currentDocument.name, { type: general.PDF }),
        annotationData,
      };
    } catch (error: unknown) {
      const gqlError = errorUtils.extractGqlError(error);
      if (gqlError.code === ErrorCode.Common.NOT_FOUND) {
        return {
          error: ErrorCode.Common.NOT_FOUND,
        };
      }
      this.loggerError({ error: error as string });
      return null;
    }
  }

  loggerError(error: Pick<IDocumentVersioningLoggerError, 'error'>) {
    super.loggerError({ error: error.error, reason: LOGGER.Service.LUMIN_REVISION_API_ERROR });
  }
}
