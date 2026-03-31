import core from 'core';

import { passwordHandlers } from 'helpers/passwordHandlers';

import { file as fileUtils } from 'utils';

import { SUPPORTED_FILE_TYPES } from 'features/MultipleMerge/constants';

import { DocumentBaseItem } from './base';
import { UploadDocumentError, UploadStatus } from '../../enum';
import { BaseDocumentItemType, GetDocumentDataType } from '../../types';

export class LocalDocumentItem extends DocumentBaseItem {
  protected _id: string;

  protected _name: string;

  private _file: File;

  protected _onError: (error: Error) => void;

  protected _onSetupPasswordHandler: (params: { attempt: number; name: string }) => void;

  protected _onLoadDocumentComplete: () => void;

  constructor({
    _id,
    file,
    name,
    onError,
    onLoadDocumentComplete,
    onSetupPasswordHandler,
  }: BaseDocumentItemType & {
    file: File;
  }) {
    super();

    this._id = _id;
    this._file = file;
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
        file: this._file,
      };
      try {
        let attempt = -1;
        const docInstance = await core.CoreControls.createDocument(this._file, {
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
            this._onSetupPasswordHandler({ attempt, name: this._file.name });
          },
          extension: fileUtils.getExtension(this._file.name),
          loadAsPDF: Object.values(SUPPORTED_FILE_TYPES).some((type) => type.includes(this._file.type)),
        });
        const buffer = await super.getFileBufferFromSecureDoc({ docInstance, file: this._file });
        const thumbnailCanvas = await fileUtils.getThumbnailWithDocument(docInstance, { thumbSize: 60 });
        resolve({
          ...baseData,
          buffer,
          thumbnail: thumbnailCanvas.toDataURL(),
          status: UploadStatus.UPLOADED,
        });
        this._onLoadDocumentComplete();
      } catch (error) {
        this._onError(new Error(`Failed to get document data of local document: ${this._name}`, { cause: error }));
        resolve({
          ...baseData,
          status: UploadStatus.FAILED,
        });
      }
    });
  }
}
