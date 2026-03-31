import isBoolean from 'lodash/isBoolean';

export default async function isDocumentEncrypted(docViewer: Core.DocumentViewer) {
  const pdfDoc = await docViewer.getDocument().getPDFDoc();
  await pdfDoc.initSecurityHandler();
  const securityHandler = await pdfDoc.getSecurityHandler();
  const isEncrypted = await pdfDoc.isEncrypted();
  const isRequiredPassword = securityHandler && (await securityHandler.isUserPasswordRequired());
  return isEncrypted && (!isBoolean(isRequiredPassword) || isRequiredPassword);
}