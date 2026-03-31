/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-self-import */
import v4 from 'uuid/v4';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import documentServices from 'services/documentServices';

import fileUtil from 'utils/file';

import { ANNOTATION_CHANGE_SOURCE } from 'constants/documentConstants';
import { MANIPULATION_TYPE } from 'constants/lumin-common';
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, THUMBNAIL_RATIO } from 'constants/thumbnailConstants';

import array from './array';
import manipulation from './manipulation';
import { getMatchingWordByKeyWordRegex } from './regex';
import { store } from '../redux/store';

const { getState, dispatch } = store;

function rotateCssPage({ pageIndex, angle }) {
  const thumbs = [...selectors.getThumbs(getState())];
  if (!thumbs.length || !thumbs[pageIndex]) {
    return;
  }
  const { width, height, className } = thumbs[pageIndex];
  const ratio = width / height;
  const { width: widthOfCanvas } = manipulation.setDimensionThumbnail(THUMBNAIL_RATIO, ratio);
  const params = {
    thumbs,
    angle,
    widthOfCanvas,
    ratio,
    width,
    height,
    pageIndex,
  };
  if (className === '') {
    manipulation.calcDimensionCanvasFromZeroAngle(params);
  } else if (className === 'thumb-rotate-right') {
    manipulation.calcDimensionCanvasFromRightRotate(params);
  } else if (className === 'thumb-rotate-left') {
    manipulation.calcDimensionCanvasFromLeftRotate(params);
  } else {
    manipulation.calcDimensionCanvasFromInvert(params);
  }
  dispatch(actions.updateThumbs(thumbs));
}

function calcDimensionCanvasFromZeroAngle({ thumbs, angle, widthOfCanvas, ratio, width, height, pageIndex }) {
  thumbs[pageIndex].className = `thumb-rotate-${angle === 1 ? 'right' : 'left'}`;
  if (width < height) {
    if (height > widthOfCanvas) {
      thumbs[pageIndex].height = widthOfCanvas;
      thumbs[pageIndex].width = widthOfCanvas * ratio;
    }
  } else if (height < widthOfCanvas) {
    thumbs[pageIndex].height = widthOfCanvas;
    thumbs[pageIndex].width = widthOfCanvas * ratio;
  }
  return thumbs;
}

function calcDimensionCanvasFromRightRotate({ thumbs, angle, widthOfCanvas, ratio, width, height, pageIndex }) {
  thumbs[pageIndex].className = `${angle === 1 ? 'thumb-rotate-bottom' : ''}`;
  if (width < height) {
    if (width < widthOfCanvas) {
      thumbs[pageIndex].width = widthOfCanvas;
      thumbs[pageIndex].height = widthOfCanvas / ratio;
    }
  } else if (width > widthOfCanvas) {
    thumbs[pageIndex].width = widthOfCanvas;
    thumbs[pageIndex].height = widthOfCanvas / ratio;
  }
  return thumbs;
}

function calcDimensionCanvasFromLeftRotate({ thumbs, angle, widthOfCanvas, ratio, width, height, pageIndex }) {
  thumbs[pageIndex].className = `${angle === 1 ? '' : 'thumb-rotate-bottom'}`;
  if (width < height) {
    if (width < widthOfCanvas) {
      thumbs[pageIndex].width = widthOfCanvas;
      thumbs[pageIndex].height = widthOfCanvas / ratio;
    }
  } else if (width > widthOfCanvas) {
    thumbs[pageIndex].width = widthOfCanvas;
    thumbs[pageIndex].height = widthOfCanvas / ratio;
  }
  return thumbs;
}

function calcDimensionCanvasFromInvert({ thumbs, angle, widthOfCanvas, ratio, width, height, pageIndex }) {
  thumbs[pageIndex].className = `thumb-rotate-${angle === 1 ? 'left' : 'right'}`;
  if (width < height) {
    if (height > widthOfCanvas) {
      thumbs[pageIndex].height = widthOfCanvas;
      thumbs[pageIndex].width = widthOfCanvas * ratio;
    }
  } else if (height < widthOfCanvas) {
    thumbs[pageIndex].height = widthOfCanvas;
    thumbs[pageIndex].width = widthOfCanvas * ratio;
  }
  return thumbs;
}

async function getDocumentCanvasByIndex(pageNumber, { thumbSize = 350, multiplier = 1.2 }) {
  const doc = core.getDocument();
  const pageInfo = doc.getPageInfo(1);
  return new Promise((resolve, reject) => {
    const zoom = (thumbSize / Math.max(pageInfo.width, pageInfo.height)) * multiplier;

    doc.loadCanvas({
      pageNumber,
      zoom,
      useProgress: true,
      allowUseOfOptimizedThumbnail: true,
      drawComplete: async (canvas) => {
        if (!canvas) {
          reject(new Error('Cannot get the canvas'));
          return;
        }
        let rotation = core.getCompleteRotation(pageNumber) - core.getRotation(pageNumber);
        if (rotation < 0) {
          /**
           * 4rad = 360deg
           */
          // eslint-disable-next-line no-magic-numbers
          rotation += 4;
        }
        const drawAnnotations = (ctx, targetCanvas) => {
          core.setAnnotationCanvasTransform(ctx, zoom, rotation);
          core.drawAnnotations({ pageNumber, overrideCanvas: targetCanvas });
          resolve(targetCanvas);
        };

        if (canvas instanceof Image) {
          const newCanvas = await fileUtil.getCanvasFromUrl(canvas.src);
          const canvasContext = newCanvas.getContext('2d');
          drawAnnotations(canvasContext, newCanvas);
          return;
        }

        const ctx = canvas.getContext('2d');
        drawAnnotations(ctx, canvas);
      },
    });
  });
}
async function onLoadThumbs(pageIndex) {
  const thumb = await manipulation.getDocumentCanvasByIndex(pageIndex + 1, {});
  thumb.className = 'page-image';
  // eslint-disable-next-line no-magic-numbers
  const width = thumb.style.width.slice(0, -2) * 1;
  // eslint-disable-next-line no-magic-numbers
  const height = thumb.style.height.slice(0, -2) * 1;
  const ratio = width / height;
  const { width: widthOfCanvas, height: heightOfCanvas } = manipulation.setDimensionThumbnail(THUMBNAIL_RATIO, ratio);
  return manipulation.convertCanvasToImageObject(thumb, widthOfCanvas, heightOfCanvas, pageIndex + 1);
}

function setDimensionThumbnail(containerRatio, ratio) {
  let widthOfCanvas = 0;
  let heightOfCanvas = 0;
  if (ratio > containerRatio) {
    widthOfCanvas = THUMBNAIL_WIDTH;
    heightOfCanvas = Math.round(widthOfCanvas / ratio);
  } else {
    heightOfCanvas = THUMBNAIL_HEIGHT;
    widthOfCanvas = Math.round(heightOfCanvas * ratio);
  }
  return {
    width: widthOfCanvas,
    height: heightOfCanvas,
  };
}

async function executeRotate({ option: { pageIndexes, angle }, needUpdateThumbnail, thumbs }) {
  if (!Array.isArray(pageIndexes)) {
    return;
  }
  if (needUpdateThumbnail && thumbs && thumbs.length) {
    const newThumbs = [...thumbs];
    for (let index = 0; index < pageIndexes.length; ++index) {
      const rotatePage = pageIndexes[index];
      manipulation.rotateCssPage({ pageIndex: rotatePage - 1, angle });
    }
    store.dispatch(actions.updateThumbs(newThumbs));
  }
  await core.rotatePages(pageIndexes, angle);
  core.updateView();
}

async function executeMovePage({ option: { pagesToMove, insertBeforePage }, needUpdateThumbnail, thumbs }) {
  const pagesToMoveInt = parseInt(pagesToMove);
  const insertBeforePageInt = parseInt(insertBeforePage);
  const thumbsUpdate = [];
  for (let i = 0; i < thumbs.length; i++) {
    thumbsUpdate[i] = thumbs[i];
  }
  if (pagesToMoveInt !== insertBeforePageInt) {
    if (pagesToMoveInt > insertBeforePageInt) {
      await core.movePages([pagesToMoveInt], insertBeforePageInt);
    }
    if (pagesToMoveInt < insertBeforePage) {
      await core.movePages([pagesToMoveInt], insertBeforePageInt + 1);
    }
    if (needUpdateThumbnail && thumbs && thumbs.length) {
      const thumbMove = await manipulation.onLoadThumbs(insertBeforePageInt - 1);
      const tempThumbnail = {
        ...thumbMove,
        ...thumbs[pagesToMoveInt - 1],
      };
      thumbsUpdate.splice(pagesToMoveInt - 1, 1);
      thumbsUpdate.splice(insertBeforePageInt - 1, 0, tempThumbnail);
      store.dispatch(actions.updateThumbs(thumbsUpdate));
    }
  }
  core.updateView();
}

async function executeRemovePage({ option: { pagesRemove }, needUpdateThumbnail, thumbs, removeMultiPages = false }) {
  const totalPages = core.getTotalPages();
  const uniquePagesToRemove = [...new Set(pagesRemove)];
  if (uniquePagesToRemove.length >= totalPages) {
    return;
  }

  core.disableReadOnlyMode();
  await core.removePages(pagesRemove);

  if (needUpdateThumbnail && thumbs && thumbs.length) {
    let newThumbList = [];
    if (!removeMultiPages) {
      newThumbList = array.removeElementFromArrayByIndex({
        array: thumbs,
        removeIndex: pagesRemove[0],
      });
      store.dispatch(actions.deleteThumbs(pagesRemove[0]));
    } else {
      newThumbList = array.removeElementsByRange({
        array: thumbs,
        from: pagesRemove[0],
        to: pagesRemove[pagesRemove.length - 1],
      });
      store.dispatch(actions.updateThumbs(newThumbList));
    }
  }
  core.updateView();
}

async function executeSocketRemovePage({ currentDocument, pagesRemove, annotationDeleted, manipulationId }) {
  const totalPages = core.getTotalPages();
  // Wait for deleting all annotations before deleleting page
  documentServices.emitSocketRemovePage({
    currentDocument,
    totalPages,
    deletedAnnotIds: annotationDeleted && annotationDeleted.map((annot) => annot.Id),
    option: {
      pagesRemove,
    },
    manipulationId,
  });
}

async function executeInsertBlankPage({ option: { insertPages }, needUpdateThumbnail, thumbs }) {
  const sizePage = {
    width: 612,
    height: 792,
  };
  await core.insertBlankPages(insertPages, sizePage);
  if (needUpdateThumbnail && thumbs && thumbs.length) {
    const blankThumbnails = await Promise.all(
      insertPages.map(async (_, idx) => ({
        ...(await manipulation.onLoadThumbs(insertPages[idx] + idx - 1)),
        id: v4(),
      }))
    );
    store.dispatch(
      actions.insertBlankThumbnails({
        blankThumbnails,
        from: insertPages[0] - 1,
      })
    );
  }
  core.updateView();
}

async function executeCropPage({ option, needUpdateThumbnail, thumbs }) {
  const { pageCrops, top, bottom, left, right } = option;
  const topToCrop = parseInt(top);
  const bottomToCrop = parseInt(bottom);
  const leftToCrop = parseInt(left);
  const rightToCrop = parseInt(right);
  await core.cropPages(pageCrops, topToCrop, bottomToCrop, leftToCrop, rightToCrop);
  if (needUpdateThumbnail && thumbs && thumbs.length) {
    const thumbCrop = await manipulation.onLoadThumbs(pageCrops[0] - 1);
    const thumbsUpdate = [...thumbs];
    thumbsUpdate[pageCrops[0] - 1] = thumbCrop;
    store.dispatch(actions.updateThumbs(thumbsUpdate));
  }
  core.updateView();
}

async function executeManipulationFromData({ data, thumbs, needUpdateThumbnail = true }) {
  const { option, type } = data;
  const param = {
    option,
    needUpdateThumbnail,
    thumbs,
  };
  switch (type) {
    case MANIPULATION_TYPE.ROTATE_PAGE: {
      await manipulation.executeRotate(param);
      break;
    }
    case MANIPULATION_TYPE.MOVE_PAGE: {
      await manipulation.executeMovePage(param);
      break;
    }
    case MANIPULATION_TYPE.REMOVE_PAGE: {
      await manipulation.executeRemovePage(param);
      break;
    }
    case MANIPULATION_TYPE.INSERT_BLANK_PAGE: {
      await manipulation.executeInsertBlankPage(param);
      break;
    }
    case MANIPULATION_TYPE.CROP_PAGE: {
      await manipulation.executeCropPage(param);
      break;
    }
    case MANIPULATION_TYPE.MERGE_PAGE: {
      // TODO
      break;
    }
    default: {
      break;
    }
  }
}

function saveRotateOfThumbOutsideViewport({ index, angle }) {
  const angleList = window.localStorage.getItem(`manipulation-${index}`);
  if (angleList) {
    const angleListFormatted = JSON.parse(angleList);
    angleListFormatted.push(angle);
    window.localStorage.setItem(`manipulation-${index}`, JSON.stringify(angleListFormatted));
  } else {
    window.localStorage.setItem(`manipulation-${index}`, JSON.stringify([angle]));
  }
}

function removeDataAfterRotate(index) {
  window.localStorage.removeItem(`manipulation-${index}`);
}

function convertCanvasToImageObject(canvas, width, height, pageIndex) {
  const src = canvas; /* .toDataURL('image/jpg'); */
  return {
    src,
    width,
    height,
    className: '',
    pageIndex,
  };
}

async function undoDeletePageCore(pageRemove, blobPageDeleted, annotationDeleted) {
  const newDoc = new core.CoreControls.Document(`doc${pageRemove}`, 'pdf');
  const backendType = await core.CoreControls.getDefaultBackendType();
  const workerTransportPromise = core.CoreControls.initPDFWorkerTransports(backendType, {});
  await manipulation.insertPageAfterUndoDelete({
    newDoc,
    blobPageDeleted,
    annotationDeleted,
    workerTransportPromise,
    pageRemove,
  });
}

async function insertPageAfterUndoDelete({
  newDoc,
  pageRemove,
  blobPageDeleted,
  annotationDeleted,
  workerTransportPromise,
}) {
  const partRetriever = await core.CoreControls.PartRetrievers.getPartRetriever(
    core.CoreControls.PartRetrievers.TYPES.LocalPdfPartRetriever,
    blobPageDeleted
  );
  return new Promise(async (resolve, reject) => {
    newDoc.loadAsync(
      partRetriever,
      async (error) => {
        try {
          if (error) {
            throw error;
          }
          await core.getDocument().insertPages(newDoc, [1], pageRemove);
          core.addAnnotations(annotationDeleted, { source: ANNOTATION_CHANGE_SOURCE.LUMIN_UNDO_PAGES_DELETED });
          resolve();
        } catch (err) {
          reject(err);
        }
      },
      { workerTransportPromise }
    );
  });
}

function renameAnnotAndWidget() {
  core.setPagesUpdatedInternalAnnotationsTransform((originalData, pages, callback) => {
    const parser = new DOMParser();
    const xfdfElements = parser.parseFromString(originalData, 'text/xml');
    const parentAnnots = xfdfElements.querySelector('annots');
    const annotationElements = parentAnnots ? Array.from(parentAnnots.children) : [];

    const parentFields = xfdfElements.querySelector('fields');
    const parentPdfInfo = xfdfElements.querySelector('pdf-info');
    const widgetElements = parentPdfInfo.querySelectorAll('widget');
    const fieldsNameObj = {};
    const commentKeyValue = {};
    annotationElements.concat(Array.from(widgetElements)).forEach((annotation) => {
      const newId = v4();
      const oldId = annotation.getAttribute('name');
      const customData = annotation.querySelector('trn-custom-data');
      const apref = annotation.querySelector('apref');
      const isReplyAnnot = annotation.getAttribute('inreplyto');
      commentKeyValue[oldId] = newId;
      if (apref) {
        annotation.removeChild(apref);
      }
      /* SET NEW ID */
      annotation.setAttribute('name', newId);
      if (isReplyAnnot) {
        annotation.setAttribute('inreplyto', commentKeyValue[isReplyAnnot]);
      }

      /* SET NEW ID FOR HIGHLIGHT ANNOTATION */
      if (customData) {
        const customDataObj = JSON.parse(customData.getAttribute('bytes'));
        const isHighlightCommentAnnotation = customDataObj.isHighlightComment;
        if (isHighlightCommentAnnotation) {
          customDataObj.stickyLinkId = commentKeyValue[customDataObj.stickyLinkId];
        }
        customData.setAttribute('bytes', JSON.stringify(customDataObj));
        annotation.appendChild(customData);
      }
    });
    /* Set unique field name */
    if (parentFields) {
      const fields = parentFields.children;
      const timestamp = new Date().valueOf();
      Array.from(fields).forEach((field) => {
        const fieldName = field.getAttribute('name');
        const formFieldElement = parentPdfInfo.querySelector(`ffield[name='${fieldName}']`);
        const widgetElement = parentPdfInfo.querySelector(`widget[field='${fieldName}']`);
        const newFieldName = `${fieldName}_${timestamp}`;
        fieldsNameObj[fieldName] = newFieldName;
        field.setAttribute('name', newFieldName);
        formFieldElement?.setAttribute('name', newFieldName);
        widgetElement?.setAttribute('field', newFieldName);
      });
    }

    const serializer = new XMLSerializer();
    let xfdfString = serializer.serializeToString(xfdfElements);
    /* Set unique field name */
    Object.keys(fieldsNameObj).forEach((key) => {
      xfdfString = xfdfString.replaceAll(getMatchingWordByKeyWordRegex(key), fieldsNameObj[key]);
    });

    callback(xfdfString);
  });
}

async function executeMergePage({ docInstance, rangesArray, positionToMerge }) {
  await core.docViewer.getAnnotationsLoadedPromise();
  await core.getDocument().insertPages(docInstance, rangesArray, positionToMerge);
}

export default {
  onLoadThumbs,
  executeManipulationFromData,
  saveRotateOfThumbOutsideViewport,
  removeDataAfterRotate,
  convertCanvasToImageObject,
  getDocumentCanvasByIndex,
  rotateCssPage,
  undoDeletePageCore,
  setDimensionThumbnail,
  calcDimensionCanvasFromZeroAngle,
  calcDimensionCanvasFromRightRotate,
  calcDimensionCanvasFromLeftRotate,
  calcDimensionCanvasFromInvert,
  insertPageAfterUndoDelete,
  executeRotate,
  executeMovePage,
  executeSocketRemovePage,
  executeRemovePage,
  executeInsertBlankPage,
  executeCropPage,
  executeMergePage,
  renameAnnotAndWidget,
};
