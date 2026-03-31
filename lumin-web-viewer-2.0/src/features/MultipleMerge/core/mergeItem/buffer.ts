import { MergeBaseItem } from './base';

export class ArrayBufferMergeItem extends MergeBaseItem {
  private buffer: ArrayBuffer;

  constructor(buffer: ArrayBuffer) {
    super();
    this.buffer = buffer;
  }

  getPDFDoc(): Promise<Core.PDFNet.PDFDoc> {
    return Core.PDFNet.PDFDoc.createFromBuffer(this.buffer);
  }
}
