import core from 'core';

import { googleServices } from 'services';

import { passwordHandlers } from 'helpers/passwordHandlers';

import { file as fileUtils } from 'utils';

import { SUPPORTED_FILE_TYPES } from 'features/MultipleMerge/constants';

import { DocumentBaseItem } from './base';
import { UploadDocumentError, UploadStatus } from '../../enum';
import { BaseDocumentItemType, GetDocumentDataType } from '../../types';

export class GoogleDriveItem extends DocumentBaseItem {
  protected _id: string;

  protected _remoteId: string;

  protected _name: string;

  protected _onError: (error: Error) => void;

  protected _onSetupPasswordHandler: (params: { attempt: number; name: string }) => void;

  protected _onLoadDocumentComplete: () => void;

  constructor({ _id, remoteId, name, onError, onLoadDocumentComplete, onSetupPasswordHandler }: BaseDocumentItemType) {
    super();

    this._id = _id;
    this._remoteId = remoteId;
    this._name = name;
    this._onError = onError;
    this._onLoadDocumentComplete = onLoadDocumentComplete;
    this._onSetupPasswordHandler = onSetupPasswordHandler;
  }

  async getDocumentData(): Promise<GetDocumentDataType> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const baseData = {
        _id: this._id,
        remoteId: this._remoteId,
      };
      try {
        let attempt = -1;
        const fileInfo = await googleServices.getFileInfo(this._remoteId, '*', 'onPickFileFromGoogle');
        const file = await googleServices.downloadFile(this._remoteId, fileInfo.name);
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
            });
            this._onSetupPasswordHandler({ attempt, name: file.name });
          },
          loadAsPDF: Object.values(SUPPORTED_FILE_TYPES).some((type) => type.includes(file.type)),
        });
        const buffer = await super.getFileBufferFromSecureDoc({ docInstance, file });
        const thumbnailCanvas = await fileUtils.getThumbnailWithDocument(docInstance, { thumbSize: 60 });
        resolve({
          ...baseData,
          file,
          buffer,
          thumbnail: thumbnailCanvas.toDataURL(),
          status: UploadStatus.UPLOADED,
        });
        this._onLoadDocumentComplete();
      } catch (error) {
        this._onError(
          new Error(`Failed to get document data of google drive document: ${this._name}`, { cause: error })
        );
        resolve({
          ...baseData,
          status: UploadStatus.FAILED,
        });
      }
    });
  }
}
