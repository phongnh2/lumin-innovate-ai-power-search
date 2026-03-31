/* eslint-disable class-methods-use-this */
import core from 'core';

import sequentialRequestBuilder from 'helpers/sequentialRequestBuilder';

import { MergeItemFactory } from './mergeItem/factory';
import { RemoteMergeItem } from './mergeItem/remote';
import { FileSourceType, UploadStatusType } from '../enum';
import { MergeDocumentMetadataType } from '../types';

export class MergeHandler {
  private documents: Array<{
    buffer?: ArrayBuffer;
    id: string;
    name: string;
    remoteId?: string;
    pdfDoc: Core.PDFNet.PDFDoc;
    source: FileSourceType;
  }>;

  private _abortSignal: AbortSignal;

  private _onMergeItemComplete: (documentId: string) => void;

  private _onError: (error: Error) => void;

  private _mergeComplete: () => void;

  private _result: Core.PDFNet.PDFDoc;

  private _onSetupPasswordHandler: (params: { attempt: number; name: string }) => void = () => {};

  private _onLoadDocumentComplete: () => void = () => {};

  private _onCancelPassword: () => void = () => {};

  private _processedPdfDoc: Record<
    string,
    {
      pdfDoc?: Core.PDFNet.PDFDoc;
      status?: UploadStatusType;
      metadata?: MergeDocumentMetadataType;
    }
  > = {};

  private _fileSources: string[] = [];

  setItems(
    documents: Array<{
      buffer?: ArrayBuffer;
      id: string;
      name: string;
      pdfDoc: Core.PDFNet.PDFDoc;
      source: FileSourceType;
      remoteId?: string;
    }>
  ) {
    this.documents = documents;
    return this;
  }

  setAbortSignal(signal: AbortSignal) {
    this._abortSignal = signal;
  }

  setOnMergeItemComplete(callback: (documentId: string) => void) {
    this._onMergeItemComplete = callback;
  }

  setOnError(callback: (error: Error) => void) {
    this._onError = callback;
  }

  setOnMergeComplete(callback: () => void) {
    this._mergeComplete = callback;
  }

  setOnSetupPasswordHandler(callback: (params: { attempt: number; name: string }) => void) {
    this._onSetupPasswordHandler = callback;
  }

  setOnLoadDocumentComplete(callback: () => void) {
    this._onLoadDocumentComplete = callback;
  }

  setOnCancelPassword(callback: () => void) {
    this._onCancelPassword = callback;
  }

  private async getOrCreatePdfDoc({
    existingPdfDoc,
    buffer,
    id,
    name,
    remoteId,
  }: {
    existingPdfDoc: Core.PDFNet.PDFDoc;
    buffer: ArrayBuffer;
    id: string;
    name: string;
    remoteId?: string;
  }): Promise<{ pdfDoc?: Core.PDFNet.PDFDoc; status?: UploadStatusType; metadata?: MergeDocumentMetadataType }> {
    if (existingPdfDoc) {
      return { pdfDoc: existingPdfDoc, status: null };
    }

    const mergeItem = MergeItemFactory.createMergeItem({
      abortSignal: this._abortSignal,
      buffer,
      id,
      name,
      remoteId,
      onError: this._onError,
      onLoadDocumentComplete: this._onLoadDocumentComplete,
      onSetupPasswordHandler: this._onSetupPasswordHandler,
      onCancelPassword: this._onCancelPassword,
    });
    const pdfDoc = await mergeItem.getPDFDoc();
    const [status, metadata] =
      mergeItem instanceof RemoteMergeItem ? [mergeItem.getItemStatus(), mergeItem.getItemMetadata()] : [null, null];
    if (this._abortSignal?.aborted) {
      this._processedPdfDoc[id] = {
        metadata,
        status,
      };
      throw this._abortSignal.reason;
    }
    return {
      metadata,
      pdfDoc,
      status,
    };
  }

  async handle() {
    await core.loadFullApi();
    let rootPdfDoc: Core.PDFNet.PDFDoc = null;
    let cursor: number = null;

    await sequentialRequestBuilder(this.documents, async ({ buffer, id, name, pdfDoc: existingPdfDoc, source, remoteId }) => {
      if (this._abortSignal?.aborted) {
        throw this._abortSignal.reason;
      }

      try {
        const { metadata, pdfDoc, status } = await this.getOrCreatePdfDoc({ existingPdfDoc, buffer, id, name, remoteId });
        if (!pdfDoc) {
          this._processedPdfDoc[id] = {
            metadata,
            status,
          };
          return;
        }

        this._processedPdfDoc[id] = {
          metadata,
          pdfDoc,
          status,
        };
        if (!rootPdfDoc) {
          rootPdfDoc = pdfDoc;
          cursor = (await rootPdfDoc.getPageCount()) + 1;
          this._fileSources.push(source);
          this._onMergeItemComplete?.(id);
        } else {
          const totalPages = await pdfDoc.getPageCount();
          await rootPdfDoc.insertPages(
            cursor,
            pdfDoc,
            1,
            totalPages,
            window.Core.PDFNet.PDFDoc.InsertFlag.e_insert_bookmark
          );
          cursor += totalPages;
          this._fileSources.push(source);
          this._onMergeItemComplete?.(id);
        }
      } catch (err) {
        if (this._abortSignal?.aborted) {
          throw new Error(`User does not provide password for document: ${name}, stop processing...`, { cause: err });
        }

        this._onError?.(new Error(`Can not merge document: ${name}`, { cause: err }));
      }
    });

    if (!rootPdfDoc) {
      throw new Error('Can not merge any document');
    }

    this._result = rootPdfDoc;
    this._mergeComplete?.();
  }

  getResult() {
    return this._result;
  }

  getProcessedPdfDoc() {
    return this._processedPdfDoc;
  }

  getOtherFileSource() {
    return this._fileSources;
  }
}
