/* eslint-disable class-methods-use-this */
import core from 'core';

import { passwordHandlers } from 'helpers/passwordHandlers';

import fileUtils from 'utils/file';
import getFileService from 'utils/getFileService';

import { SUPPORTED_FILE_TYPES } from 'features/MultipleMerge/constants';

import { STORAGE_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { DocumentBaseItem } from './base';
import { getDocumentData as getDocumentDataFromAPI } from '../../apis';
import { UploadDocumentError, UploadStatus } from '../../enum';
import { BaseDocumentItemType, GetRemoteDocumentDataType } from '../../types';

export class RemoteDocumentItem extends DocumentBaseItem {
  private _abortSignal: AbortSignal;

  protected _id: string;

  protected _remoteId: string;

  protected _name: string;

  protected _onError: (error: Error) => void;

  protected _onLoadDocumentComplete: () => void;

  protected _onSetupPasswordHandler: (params: { attempt: number; name: string }) => void;

  private _onCancelPassword: () => void;

  constructor({
    _id,
    abortSignal,
    remoteId,
    name,
    onError,
    onLoadDocumentComplete,
    onSetupPasswordHandler,
    onCancelPassword,
  }: BaseDocumentItemType & {
    abortSignal: AbortSignal;
    remoteId: string;
    onCancelPassword: () => void;
  }) {
    super();

    this._abortSignal = abortSignal;
    this._id = _id;
    this._remoteId = remoteId;
    this._name = name;
    this._onError = onError;
    this._onLoadDocumentComplete = onLoadDocumentComplete;
    this._onSetupPasswordHandler = onSetupPasswordHandler;
    this._onCancelPassword = onCancelPassword;
  }

  private async getFileFromPresignedUrl(document: IDocumentBase): Promise<File> {
    const { src } = await getFileService.getFileOptions(document, {});
    return getFileService.getFileFromUrl({
      url: src,
      fileName: document.name,
      fileOptions: { type: document.mimeType },
      abortSignal: this._abortSignal,
    });
  }

  private async getFile(document: IDocumentBase): Promise<File> {
    if (document.service === STORAGE_TYPE.S3) {
      return this.getFileFromPresignedUrl(document);
    }

    return getFileService.getDocument(document);
  }

  async getDocumentData(
    { loadAsPDF }: { loadAsPDF?: boolean } = { loadAsPDF: false }
  ): Promise<Partial<GetRemoteDocumentDataType>> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const baseData = {
        _id: this._id,
        remoteId: this._remoteId,
      };
      try {
        let attempt = -1;
        const { document, annotations, outlines, fields, signedUrls } = await getDocumentDataFromAPI({
          documentId: this._remoteId,
          abortSignal: this._abortSignal,
        });
        const file = await this.getFile({ ...document });
        const docInstance = await core.CoreControls.createDocument(file, {
          password: (fn: (password: string) => void) => {
            attempt++;
            passwordHandlers.setCheckFn(fn);
            passwordHandlers.setCancelFn(() => {
              resolve({
                ...baseData,
                metadata: {
                  errorCode: UploadDocumentError.FILE_ENCRYPTED,
                },
                status: UploadStatus.FAILED,
              });
              this._onCancelPassword();
            });
            this._onSetupPasswordHandler({ attempt, name: document.name });
          },
          extension: fileUtils.getExtension(document.name),
          loadAsPDF: loadAsPDF || Object.values(SUPPORTED_FILE_TYPES).some((type) => type.includes(document.mimeType)),
        });
        const buffer = await super.getFileBufferFromSecureDoc({ docInstance, file });
        resolve({
          ...baseData,
          document,
          buffer,
          file,
          status: UploadStatus.UPLOADED,
          annotations,
          outlines,
          fields,
          signedUrls,
        });
        this._onLoadDocumentComplete();
      } catch (error) {
        const errorMessage = (error as Error).message;
        this._onError(
          new Error(`Failed to get document data of remote document: ${this._name} ${errorMessage}`, { cause: error })
        );
        resolve({
          ...baseData,
          status: UploadStatus.FAILED,
        });
      }
    });
  }
}
