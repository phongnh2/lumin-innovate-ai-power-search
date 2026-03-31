/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import core from 'core';

const verifyDocumentDigitalSigned = async () => {
  if (!core.getDocument()) {
    return false;
  }
  const doc = await core.getDocument().getPDFDoc();
  if (!(await doc.hasSignatures())) {
    return false;
  }

  const fieldIterator = await doc.getDigitalSignatureFieldIteratorBegin();
  for (; await fieldIterator.hasNext(); await fieldIterator.next()) {
    const signatureField = await fieldIterator.current();

    if (!(await signatureField.hasCryptographicSignature())) {
      continue;
    }

    const digitalSignatureDocPermission = await signatureField.getDocumentPermissions();
    switch (digitalSignatureDocPermission) {
      case window.Core.PDFNet.DigitalSignatureField.DocumentPermissions.e_no_changes_allowed:
      case window.Core.PDFNet.DigitalSignatureField.DocumentPermissions.e_formfilling_signing_allowed:
      case window.Core.PDFNet.DigitalSignatureField.DocumentPermissions.e_annotating_formfilling_signing_allowed:
        return true;
      case window.Core.PDFNet.DigitalSignatureField.DocumentPermissions.e_unrestricted:
      default:
        return false;
    }
  }
  return false;
};

export default verifyDocumentDigitalSigned;
