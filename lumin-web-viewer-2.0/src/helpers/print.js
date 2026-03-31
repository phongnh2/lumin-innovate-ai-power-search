/* eslint-disable no-use-before-define */
import i18n from 'i18next';

import actions from 'actions';
import core from 'core';

import exportAnnotations from 'helpers/exportAnnotations';
import warningPDFTronErrors from 'helpers/warningPDFTronErrors';

import { getFileDataByPDFNet } from 'utils/getFileService';

import { AnimationBanner } from 'constants/banner';
import { LOGGER } from 'constants/lumin-common';
import { workerTypes } from 'constants/types';

import logger from './logger';

let pendingCanvases = [];
let includeAnnotations = false;
let PRINT_QUALITY = 1;
const MIN_TIME_TO_WAIT_FOR_PRINT_MODAL = 250;
const PRINT_TIMEOUT = 10000;
let printTimeout;

const showRatingModal = (dispatch) => {
  dispatch(actions.setShouldShowRating(AnimationBanner.SHOW));
};

const showInviteModal = (dispatch) => {
  dispatch(actions.setShouldShowInviteCollaboratorsModal(true));
};

export const printViaWindow = (bbURLPromise, dispatch) => {
  const printPage = window.open('', '_blank');
  printPage.document.write(i18n.t('message.preparingToPrint'));
  bbURLPromise
    .then((result) => {
      printPage.location.href = result.url;
      showRatingModal(dispatch);
    })
    .catch((error) => {
      warningPDFTronErrors({
        service: LOGGER.Service.PRINT_DOCUMENT_ERROR,
        error,
      });
    });
};

const resetPrintHandlerDimensions = (printHandler) => {
  printHandler.style.width = '0';
  printHandler.style.height = '0';
};

const checkExtractDataPermission = async () => {
  try {
    if (!core.getDocument()) {
      return false;
    }

    const pdfDoc = await core.getDocument().getPDFDoc();
    const securityHandler = await pdfDoc.getSecurityHandler();

    if (!securityHandler) {
      return true;
    }

    const [extractPermission, printPermission] = await Promise.all([
      securityHandler.getPermission(window.Core.PDFNet.SecurityHandler.Permission.e_extract_content),
      securityHandler.getPermission(window.Core.PDFNet.SecurityHandler.Permission.e_print),
    ]);

    return extractPermission || printPermission;
  } catch (error) {
    logger.logError({
      error,
      reason: LOGGER.Service.PRINT_DOCUMENT_ERROR,
    });
    return true;
  }
};

export const print = async (dispatch, isEmbedPrintSupported, options = {}) => {
  const {
    printQuality = PRINT_QUALITY,
    allPages = true,
    includeAnnotations = false,
    maintainPageOrientation = true,
  } = options;

  if (!core.getDocument()) {
    return;
  }

  const documentType = core.getDocument().getType();
  const bbURLPromise = core.getPrintablePDF();
  const hasExtractPermission = await checkExtractDataPermission();

  if (bbURLPromise) {
    printViaWindow(bbURLPromise, dispatch);
  } else if (isEmbedPrintSupported && hasExtractPermission && documentType === workerTypes.PDF) {
    await printViaIframe(dispatch);
  } else {
    await printViaImage(dispatch, {
      printQuality,
      allPages,
      includeAnnotations,
      maintainPageOrientation,
    });
  }
};

export const printViaImage = async (dispatch, options) => {
  const {
    printQuality = PRINT_QUALITY,
    allPages = true,
    includeAnnotations = false,
    maintainPageOrientation = true,
  } = options;
  let pagesToPrint;
  dispatch(actions.useEmbeddedPrint(false));
  dispatch(actions.openElement('loadingModal'));
  document.getElementById('app').dataset.print = 'true';
  if (allPages) {
    pagesToPrint = [];
    for (let i = 1; i <= core.getTotalPages(); i++) {
      pagesToPrint.push(i);
    }
  }
  const createPages = creatingPages(pagesToPrint, includeAnnotations, printQuality, maintainPageOrientation);
  await Promise.all(createPages)
    .then((pages) => {
      dispatch(actions.closeElement('loadingModal'));
      printPages(pages);
      showRatingModal(dispatch);
      showInviteModal(dispatch);
    })
    .catch((printError) => {
      warningPDFTronErrors({
        service: LOGGER.Service.PRINT_DOCUMENT_ERROR,
        error: printError,
      });
    })
    .finally(() => {
      dispatch(actions.useEmbeddedPrint(true));
      delete document.getElementById('app').dataset.print;
    });
};

export const printViaIframe = async (dispatch) => {
  dispatch(actions.openElement('loadingModal'));
  dispatch(actions.useEmbeddedPrint(true));
  const buffer = await getPdfBuffer();
  if (!buffer) {
    dispatch(actions.closeElement('loadingModal'));
    dispatch(actions.useEmbeddedPrint(false));
    return;
  }
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const printHandler = document.getElementById('print-handler');
  const url = URL.createObjectURL(blob);
  try {
    printHandler.src = url;
    await waitForIframeLoadAndPrint(printHandler, url);
    showRatingModal(dispatch);
  } catch (e) {
    print(dispatch, false).catch((error) => {
      warningPDFTronErrors({
        service: LOGGER.Service.PRINT_DOCUMENT_ERROR,
        error,
      });
    });
  } finally {
    dispatch(actions.closeElement('loadingModal'));
    URL.revokeObjectURL(url);
  }
};

const getPdfBuffer = async () => {
  try {
    const xfdfString = await exportAnnotations();
    return await getFileDataByPDFNet({
      xfdf: xfdfString,
      shouldRemoveJavaScript: true,
      shouldRemoveSecurity: true,
    });
  } catch (err) {
    warningPDFTronErrors({
      service: LOGGER.Service.PRINT_DOCUMENT_ERROR,
      error: err,
    });
    return null;
  }
};

const waitForIframeLoadAndPrint = (printHandler, url) => {
  const controller = new AbortController();

  return Promise.race([handleIframeLoad(printHandler, url, controller.signal), createTimeoutPromise(controller)]);
};

const handleIframeLoad = (printHandler, url, signal) =>
  new Promise((resolve, reject) => {
    let printTimeout;

    const cleanup = () => {
      if (printTimeout) {
        clearTimeout(printTimeout);
      }
      printHandler.removeEventListener('load', loadListener);
    };

    const handleAbort = () => {
      cleanup();
      reject(new Error('Print operation aborted'));
    };

    const loadListener = () => {
      if (signal.aborted) {
        return;
      }

      setupIframeForPrint(printHandler);
      printTimeout = setTimeout(() => {
        executePrint({ printHandler, cleanup, resolve, reject });
      }, MIN_TIME_TO_WAIT_FOR_PRINT_MODAL);
    };

    signal.addEventListener('abort', handleAbort);
    printHandler.addEventListener('load', loadListener, { once: true });
  });

const createTimeoutPromise = (controller) =>
  new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error('PDF load timeout'));
    }, PRINT_TIMEOUT);
  });

const setupIframeForPrint = (printHandler) => {
  printHandler.style.width = '100%';
  printHandler.style.height = '100%';
  printHandler.style.position = 'absolute';
  printHandler.style.display = 'block';
  printHandler.style.zIndex = '99999';
};

const executePrint = ({ printHandler, cleanup, resolve, reject }) => {
  try {
    const iframeContent = printHandler.contentWindow || printHandler.contentDocument || printHandler;
    printHandler.focus();
    iframeContent.print();

    resetPrintHandlerDimensions(printHandler);

    cleanup();
    resolve();
  } catch (err) {
    cleanup();
    reject(err);
  }
};

export const creatingPages = (pagesToPrint, includeAnnot, printQuality, maintainPageOrientation) => {
  const createdPages = [];
  pendingCanvases = [];
  includeAnnotations = includeAnnot;
  PRINT_QUALITY = printQuality;

  pagesToPrint.forEach((pageNumber) => {
    const printableAnnotations = getPrintableAnnotations(pageNumber);
    createdPages.push(creatingImage(pageNumber, printableAnnotations, maintainPageOrientation));
  });

  return createdPages;
};

export const printPages = (pages) => {
  const printHandler = document.getElementById('print-handler');
  printHandler.innerHTML = '';
  setupIframeForPrint(printHandler);

  const fragment = document.createDocumentFragment();
  pages.forEach((page) => {
    fragment.appendChild(page);
  });

  printHandler.appendChild(fragment);
  window.print();
  resetPrintHandlerDimensions(printHandler);
};

export const cancelPrint = () => {
  const doc = core.getDocument();
  pendingCanvases.forEach((id) => doc.cancelLoadCanvas(id));
  if (printTimeout) {
    clearTimeout(printTimeout);
  }
};

const getPrintableAnnotations = (pageNumber) =>
  core
    .getAnnotationsList()
    .filter(
      (annotation) =>
        annotation.Listable &&
        annotation.PageNumber === pageNumber &&
        !annotation.isReply() &&
        !annotation.isGrouped() &&
        annotation.Printable
    );

const creatingImage = (pageNumber, printableAnnotations, maintainPageOrientation) =>
  new Promise((resolve) => {
    const zoom = 1;
    const printRotation = getPrintRotation(pageNumber, maintainPageOrientation);
    const onCanvasLoaded = async (canvas) => {
      pendingCanvases = pendingCanvases.filter((pendingCanvas) => pendingCanvas !== id);
      positionCanvas(canvas, pageNumber);

      if (includeAnnotations) {
        await drawAnnotationsOnCanvas(canvas, pageNumber);
      } else {
        // disable all printable annotations before draw
        printableAnnotations.forEach((annot) => (annot.Printable = false));
        await drawAnnotationsOnCanvas(canvas, pageNumber);
        // enable all printable annotations after draw
        printableAnnotations.forEach((annot) => (annot.Printable = true));
      }

      const img = document.createElement('img');
      img.src = canvas.toDataURL();
      img.onload = () => {
        resolve(img);
      };
    };
    const id = core.getDocument().loadCanvas({
      pageNumber,
      zoom,
      pageRotation: printRotation,
      drawComplete: onCanvasLoaded,
      multiplier: PRINT_QUALITY,
    });
    pendingCanvases.push(id);
  });

const getPrintRotation = (pageNumber, maintainPageOrientation) => {
  if (!maintainPageOrientation) {
    const { width, height } = core.getPageInfo(pageNumber);
    const documentRotation = getDocumentRotation(pageNumber);
    let printRotation = (4 - documentRotation) % 4;

    // automatically rotate pages so that they fill up as much of the printed page as possible
    if (printRotation % 2 === 0 && width > height) {
      printRotation++;
    } else if (printRotation % 2 === 1 && height > width) {
      printRotation--;
    }
    return printRotation;
  }

  return 0;
};

const positionCanvas = (canvas, pageNumber) => {
  const { width, height } = core.getPageInfo(pageNumber);
  const documentRotation = getDocumentRotation(pageNumber);
  const ctx = canvas.getContext('2d');

  switch (documentRotation) {
    case 1:
      ctx.translate(width, 0);
      break;
    case 2:
      ctx.translate(width, height);
      break;
    case 3:
      ctx.translate(0, height);
      break;
    default:
      return;
  }

  ctx.rotate((documentRotation * 90 * Math.PI) / 180);
};

const drawAnnotationsOnCanvas = (canvas, pageNumber) => {
  const widgetAnnotations = core
    .getAnnotationsList()
    .filter((annot) => annot.PageNumber === pageNumber && annot instanceof window.Core.Annotations.WidgetAnnotation);
  // just draw markup annotations
  if (widgetAnnotations.length === 0) {
    return core.drawAnnotations({ pageNumber, overrideCanvas: canvas });
  }
  // draw all annotations
  const widgetContainer = createWidgetContainer(pageNumber);
  return core
    .drawAnnotations({ pageNumber, overrideCanvas: canvas, majorRedraw: true, overrideContainer: widgetContainer })
    .then(() => {
      document.body.appendChild(widgetContainer);

      return import(/* webpackChunkName: 'html2canvas' */ 'html2canvas').then(({ default: html2canvas }) =>
        html2canvas(widgetContainer, {
          canvas,
          backgroundColor: null,
          scale: 1,
          logging: false,
        }).then(() => {
          document.body.removeChild(widgetContainer);
        })
      );
    });
};

const getDocumentRotation = (pageNumber) => {
  const completeRotation = core.getCompleteRotation(pageNumber);
  const viewerRotation = core.getRotation(pageNumber);

  return (completeRotation - viewerRotation + 4) % 4;
};

const createWidgetContainer = (pageNumber) => {
  const { width, height } = core.getPageInfo(pageNumber);
  const widgetContainer = document.createElement('div');

  widgetContainer.id = 'print-widget-container';
  widgetContainer.style.width = width;
  widgetContainer.style.height = height;
  widgetContainer.style.position = 'relative';
  widgetContainer.style.top = '-10000px';

  return widgetContainer;
};
