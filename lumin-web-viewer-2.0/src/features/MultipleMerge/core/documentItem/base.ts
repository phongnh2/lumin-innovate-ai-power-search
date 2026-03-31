import { general } from 'constants/documentType';

import { MergeDocumentType } from '../../types';

export abstract class DocumentBaseItem {
  protected abstract _id: string;

  protected abstract _name: string;

  protected abstract _onError: (error: Error) => void;

  protected abstract _onLoadDocumentComplete: () => void;

  protected abstract _onSetupPasswordHandler: (params: { attempt: number; name: string }) => void;

  abstract getDocumentData(): Promise<Partial<MergeDocumentType>>;

  // eslint-disable-next-line class-methods-use-this
  protected async getFileBufferFromSecureDoc({
    docInstance,
    file,
  }: {
    docInstance: Core.Document;
    file: File;
  }): Promise<ArrayBuffer> {
    if (file.type !== general.PDF) {
      return docInstance.getFileData({ flags: window.Core.SaveOptions.INCREMENTAL });
    }

    const pdfDoc = await docInstance.getPDFDoc();
    await pdfDoc.removeSecurity();
    const data = await pdfDoc.saveMemoryBuffer(window.Core.PDFNet.SDFDoc.SaveOptions.e_linearized);
    return new Uint8Array(data);
  }
}
