import range from 'lodash/range';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import fireEvent from 'helpers/fireEvent';
import getCurrentRole from 'helpers/getCurrentRole';
import getDefaultPageLabels from 'helpers/getDefaultPageLabels';
import getHashParams from 'helpers/getHashParams';
import { getLeftPanelDataElements } from 'helpers/isDataElementPanel';

import { isValidToApplyOCR } from 'features/DocumentOCR/utils';
import { OutlineStoreUtils } from 'features/Outline/utils/outlineStore.utils';

import { PRIORITY_ONE, PRIORITY_TWO } from 'constants/actionPriority';
import { documentStorage } from 'constants/documentConstants';
import { general, images } from 'constants/documentType';
import fitMode from 'constants/fitMode';
import { LocalStorageKey } from 'constants/localStorageKey';
import { DOCUMENT_ROLES } from 'constants/lumin-common';
import { workerTypes } from 'constants/types';

let onFirstLoad = true;

const runWithCleanup = (store, pdfDoc, checkIfDocumentClosed) => () => {
  const main = async () => {
    try {
      checkIfDocumentClosed();
      const pageCount = await pdfDoc.getPageCount();
      const pageLabels = [];

      for (let i = 1; i <= pageCount; i++) {
        checkIfDocumentClosed();
        // eslint-disable-next-line no-await-in-loop
        const pageLabel = await pdfDoc.getPageLabel(i);
        checkIfDocumentClosed();
        // eslint-disable-next-line no-await-in-loop
        const label = await pageLabel.getLabelTitle(i);
        pageLabels.push(label.length > 0 ? label : i.toString());
      }

      checkIfDocumentClosed();
      store.dispatch(actions.setPageLabels(pageLabels));
    } catch (e) {
      console.warn(e);
    }
  };

  window.Core.PDFNet.runWithCleanup(main);
};

const cleanPDFNet = async (store) => {
  if (core.isFullPDFEnabled()) {
    let isDocumentClosed = false;
    const documentUnloadedHandler = () => {
      isDocumentClosed = true;
    };

    const checkIfDocumentClosed = () => {
      if (isDocumentClosed) {
        core.removeEventListener('documentUnloaded', documentUnloadedHandler);
        throw new Error('setPageLabels is cancelled because the document got closed.');
      }
    };

    core.addEventListener('documentUnloaded', documentUnloadedHandler, { once: true });
    checkIfDocumentClosed();
    const pdfDoc = await core.getDocument().getPDFDoc();
    if (!pdfDoc) {
      return;
    }

    window.Core.PDFNet.initialize().then(runWithCleanup(store, pdfDoc, checkIfDocumentClosed));
  }
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default (store) => async () => {
  const { dispatch, getState } = store;
  if (!core.getDocument()) {
    return window.location.reload();
  }

  const totalPages = core.getTotalPages();

  dispatch(actions.setPageLabels(getDefaultPageLabels(totalPages)));
  dispatch(actions.setTotalPages(totalPages));

  dispatch(actions.openElement('pageNavOverlay'));
  dispatch(actions.setLoadingProgress(1));

  // set timeout so that progress modal can show progress bar properly
  setTimeout(() => {
    dispatch(actions.closeElement('progressModal'));
    dispatch(actions.resetLoadingProgress());
  }, 0);

  if (onFirstLoad) {
    onFirstLoad = false;
    // redaction button starts hidden. when the user first loads a document, check HashParams the first time
    if (getHashParams('enableRedaction', false) || core.isCreateRedactionEnabled()) {
      core.enableRedaction();
    } else {
      core.disableRedaction();
    }
    // if redaction is already enabled for some reason (i.e. calling readerControl.enableRedaction() before loading a doc), keep it enabled

    if (core.isCreateRedactionEnabled()) {
      dispatch(actions.enableElement('redactionButton', PRIORITY_TWO));
    } else {
      dispatch(actions.disableElement('redactionButton', PRIORITY_TWO));
    }
  }

  core.enableAnnotations();

  const currentDocument = selectors.getCurrentDocument(store.getState());
  if (!currentDocument) {
    return null;
  }

  const isLoadingGetDocumentOutlines = selectors.getIsLoadingDocumentOutlines(store.getState());
  const isPreviewOriginalVersionMode = selectors.isPreviewOriginalVersionMode(store.getState());
  if (!isLoadingGetDocumentOutlines && !isPreviewOriginalVersionMode) {
    OutlineStoreUtils.initialOutlines({ currentDocument });
  }

  const doc = core.getDocument();
  if (!doc) {
    return null;
  }
  if (!doc.isWebViewerServerDocument()) {
    doc.getLayersArray().then((layers) => {
      if (layers.length === 0) {
        dispatch(actions.disableElement('layersPanel', PRIORITY_ONE));
        dispatch(actions.disableElement('layersPanelButton', PRIORITY_ONE));

        const state = getState();
        const activeLeftPanel = selectors.getActiveLeftPanel(state);
        if (activeLeftPanel === 'layersPanel') {
          // set the active left panel to another one that's not disabled so that users don't see a blank left panel
          const nextActivePanel = getLeftPanelDataElements(state).find(
            (dataElement) => !selectors.isElementDisabled(state, dataElement)
          );

          dispatch(actions.setActiveLeftPanel(nextActivePanel));
        }
      } else {
        dispatch(actions.enableElement('layersPanel', PRIORITY_ONE));
        dispatch(actions.enableElement('layersPanelButton', PRIORITY_ONE));
        dispatch(actions.setLayers(layers));
      }
    });
  }

  if (doc.getType() === workerTypes.PDF) {
    dispatch(actions.enableElement('cropToolButton', PRIORITY_ONE));
  } else {
    dispatch(actions.disableElement('cropToolButton', PRIORITY_ONE));
  }

  await cleanPDFNet(store);

  const zoomingLevel = parseFloat(JSON.parse(localStorage.getItem(LocalStorageKey.VIEWER_ZOOMING_LEVEL)));
  if (!Number.isNaN(zoomingLevel) && zoomingLevel > 0) {
    core.setZoomLevel(zoomingLevel);
  } else {
    core.setFitMode(fitMode.FitPage);
  }

  fireEvent('documentLoaded');

  const currentRole = getCurrentRole(currentDocument);
  const canEditDocument = [DOCUMENT_ROLES.EDITOR, DOCUMENT_ROLES.SHARER, DOCUMENT_ROLES.OWNER].includes(currentRole);
  const isValidStorage = [documentStorage.s3, documentStorage.caching, documentStorage.google].includes(
    currentDocument.service
  );
  const isValidFileType = [images.PNG, images.JPEG, images.JPG, general.PDF].includes(currentDocument.mimeType);
  const canShowOCR = isValidStorage && isValidFileType;
  const hasAppliedOCR = currentDocument.metadata?.hasAppliedOCR;
  if (canEditDocument && canShowOCR && !hasAppliedOCR) {
    const pagesArray = range(1, totalPages + 1);
    const pageTextsArray = await Promise.all(pagesArray.map((pageNumber) => doc.loadPageText(pageNumber)));
    const isFullyScannedDocument = pageTextsArray.every((pageText) => !pageText || pageText.length === 0);
    if (isFullyScannedDocument && isValidToApplyOCR(currentDocument)) {
      store.dispatch(actions.setShouldShowOCRBanner(true));
    }
  }
};
