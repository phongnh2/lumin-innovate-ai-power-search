import selectors from 'selectors';
import { store } from 'store';

import logger from 'helpers/logger';

import featureStoragePolicies, { AppFeatures } from 'features/FeatureConfigs/featureStoragePolicies';

import { DocumentHeight } from 'constants/documentConstants';

export const getDocumentHeight = (isTabletUpMatch) =>
  isTabletUpMatch ? DocumentHeight.Desktop : DocumentHeight.Mobile;

export const convertFileToBlob = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([new Uint8Array(arrayBuffer)], { type: file.type });
    blob.name = file.name;
    return blob;
  } catch (e) {
    return file;
  }
};

export const includeFormFields = async (documentInstance) => {
  try {
    const doc = await documentInstance.getPDFDoc();
    const fdf = await doc.fdfExtract(window.Core.PDFNet.PDFDoc.ExtractFlag.e_forms_only);
    const fdfString = await fdf.saveAsXFDFAsString();
    return fdfString.includes('<fields>');
  } catch (e) {
    logger.logError({ error: e });
    return false;
  }
};

export const canUseImageSignedUrl = () => {
  const state = store.getState();

  const currentDocument = selectors.getCurrentDocument(state);
  const isOffline = selectors.isOffline(state);
  const annotationsLoaded = selectors.getAnnotationsLoaded(state);

  const isValidStorage = featureStoragePolicies.isFeatureEnabledForStorage(
    AppFeatures.SIGNED_URL_IMAGE,
    currentDocument.service
  );
  const isInTempEditMode = currentDocument.temporaryEdit;
  return isValidStorage && !isOffline && annotationsLoaded && !isInTempEditMode;
};
