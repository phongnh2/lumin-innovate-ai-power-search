/* eslint-disable class-methods-use-this */
import { PdfProcessor } from 'features/PdfProcessor/pdfProcessor';

import { MergeBaseItem } from './base';
import { UploadStatus, UploadStatusType } from '../../enum';
import { MergeDocumentMetadataType } from '../../types';
import { RemoteDocumentItem } from '../documentItem/remote';

export class RemoteMergeItem extends MergeBaseItem {
  private _itemStatus: UploadStatusType;

  private _itemMetadata: MergeDocumentMetadataType;

  private _documentItem: RemoteDocumentItem;

  constructor({
    abortSignal,
    id,
    name,
    remoteId,
    onError,
    onLoadDocumentComplete,
    onSetupPasswordHandler,
    onCancelPassword,
  }: {
    abortSignal: AbortSignal;
    id: string;
    name: string;
    remoteId: string;
    onError: (error: Error) => void;
    onLoadDocumentComplete: () => void;
    onSetupPasswordHandler: (params: { attempt: number; name: string }) => void;
    onCancelPassword: () => void;
  }) {
    super();
    this._documentItem = new RemoteDocumentItem({
      _id: id,
      abortSignal,
      remoteId,
      name,
      onError,
      onLoadDocumentComplete,
      onSetupPasswordHandler,
      onCancelPassword,
    });
  }

  async getPDFDoc(): Promise<Core.PDFNet.PDFDoc> {
    const {
      document,
      annotations,
      outlines: arrOutline,
      buffer,
      fields,
      signedUrls,
      status,
      metadata,
    } = await this._documentItem.getDocumentData();
    this._itemStatus = status;
    this._itemMetadata = metadata;
    if (status === UploadStatus.FAILED) {
      return null;
    }

    if (!buffer) {
      throw new Error('Failed to load document');
    }

    const pdfProcessor = new PdfProcessor(document, annotations, fields, arrOutline, signedUrls, buffer);
    return pdfProcessor.process();
  }

  getItemStatus(): UploadStatusType {
    return this._itemStatus;
  }

  getItemMetadata(): MergeDocumentMetadataType {
    return this._itemMetadata;
  }
}
