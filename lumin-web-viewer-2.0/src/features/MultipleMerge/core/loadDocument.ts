/* eslint-disable class-methods-use-this */
import core from 'core';

import sequentialRequestBuilder from 'helpers/sequentialRequestBuilder';

import { DocumentItemFactory } from './documentItem/factory';
import { FileSourceType } from '../enum';

export class LoadDocumentHandler {
  private _documents: Array<{ _id: string; remoteId?: string; file: File; source: FileSourceType; name: string }>;

  private _abortSignal: AbortSignal;

  private _documentIdAbortControllers: Map<string, AbortController>;

  private _onSetupPasswordHandler: (params: { attempt: number; name: string }) => void = () => {};

  private _onLoadDocumentComplete: () => void = () => {};

  private _onError: (error: Error) => void = () => {};

  setItems(documents: Array<{ _id: string; remoteId?: string; file: File; source: FileSourceType; name: string }>) {
    this._documents = documents;
    return this;
  }

  setAbortSignal(signal: AbortSignal) {
    this._abortSignal = signal;
    return this;
  }

  setDocumentIdAbortControllers(documentIdAbortControllers: Map<string, AbortController>) {
    this._documentIdAbortControllers = documentIdAbortControllers;
    return this;
  }

  setOnSetupPasswordHandler(callback: (params: { attempt: number; name: string }) => void) {
    this._onSetupPasswordHandler = callback;
    return this;
  }

  setOnLoadDocumentComplete(callback: () => void) {
    this._onLoadDocumentComplete = callback;
    return this;
  }

  setOnError(callback: (error: Error) => void) {
    this._onError = callback;
    return this;
  }

  async handle() {
    try {
      await core.loadFullApi();
      return await sequentialRequestBuilder(this._documents, async ({ _id, file, remoteId, source, name }) => {
        if (this._abortSignal?.aborted || this._documentIdAbortControllers?.get(_id)?.signal.aborted) {
          throw this._abortSignal.reason;
        }

        const documentItem = DocumentItemFactory.createDocumentItem({
          mergeItem: { _id, remoteId, file, name, source },
          onError: this._onError,
          onLoadDocumentComplete: this._onLoadDocumentComplete,
          onSetupPasswordHandler: this._onSetupPasswordHandler,
        });
        if (!documentItem) {
          return null;
        }

        return documentItem.getDocumentData();
      });
    } catch (error) {
      throw new Error('Failed to load document', { cause: error as Error });
    }
  }
}
