import core from 'core';
import actions from 'actions';
import logger from 'helpers/logger';
import { LOGGER } from 'constants/lumin-common';
import { ERROR_MESSAGE_PDFTRON } from 'constants/messages';
import extractPagesWithAnnotations from './extractPagesWithAnnotations';
import fireEvent from './fireEvent';

export const extractPagesToMerge = (pageNumbers) => {
  // extract pages and put the data on the iFrame window element for another instance of WebViewer to access
  window.extractedDataPromise = extractPagesWithAnnotations(pageNumbers);
  window.pagesExtracted = pageNumbers;
};

export const mergeDocument = (srcToMerge, mergeToPage, shouldFireEvent = true) => (dispatch) => {
  dispatch(actions.openElement('loadingModal'));

  return new Promise((resolve, reject) => {
    core.mergeDocument(srcToMerge, mergeToPage).then((mergeResults) => {
      dispatch(actions.closeElement('loadingModal'));
      core.setCurrentPage(mergeToPage);

      if (shouldFireEvent) {
        fireEvent('documentMerged', mergeResults);
      }

      resolve(mergeResults);
    }).catch((err) => {
      reject(err);
      dispatch(actions.closeElement('loadingModal'));
    });
  });
};

export const mergeExternalWebViewerDocument = (viewerID, mergeToPage) => (dispatch) => new Promise((resolve, reject) => {
  const otherWebViewerIframe = window.parent.document.querySelector(`#${viewerID}`);
  if (!otherWebViewerIframe) {
    logger.logInfo({
      message: ERROR_MESSAGE_PDFTRON.FIND_WEBVIEWER_INSTANCE,
      reason: LOGGER.Service.PDFTRON,
    });
    reject();
  }

  const { extractedDataPromise } = otherWebViewerIframe.contentWindow;
  if (!extractedDataPromise) {
    logger.logInfo({
      message: ERROR_MESSAGE_PDFTRON.RETRIEVE_DATA_WEBVIEWER_INSTANCE,
      reason: LOGGER.Service.PDFTRON,
    });
    reject();
  }

  dispatch(actions.openElement('loadingModal'));
  extractedDataPromise.then((docToMerge) => {
    dispatch(mergeDocument(docToMerge, mergeToPage, false)).then(({ filename, pages }) => {
      fireEvent('documentMerged', { filename, pages: otherWebViewerIframe.contentWindow.pagesExtracted });
      dispatch(actions.closeElement('loadingModal'));
      resolve({ filename, pages });
    });
  }).catch((err) => {
    dispatch(actions.closeElement('loadingModal'));
    reject(err);
  });
});
