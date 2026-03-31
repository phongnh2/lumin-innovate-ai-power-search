export default async (xfdf: string): Promise<Core.PDFNet.FDFDoc> =>
  window.Core.PDFNet.FDFDoc.createFromXFDF(xfdf);
