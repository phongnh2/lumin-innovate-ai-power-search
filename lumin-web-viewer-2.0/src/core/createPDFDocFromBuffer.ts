export default async (buffer: ArrayBuffer | Int8Array | Uint8Array | Uint8ClampedArray): Promise<Core.PDFNet.PDFDoc> =>
  window.Core.PDFNet.PDFDoc.createFromBuffer(buffer);
