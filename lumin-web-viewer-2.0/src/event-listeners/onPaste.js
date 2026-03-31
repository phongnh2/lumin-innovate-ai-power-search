/* eslint-disable no-await-in-loop */
import i18next from 'i18next';

import { encoder } from '@libs/encoder';

import core from 'core';
import selectors from 'selectors';

import { isComment } from 'lumin-components/CommentPanel/helper';

import { isFirefox, isSafari } from 'helpers/device';
import getToolPopper from 'helpers/getToolPopper';
import isFocusingElement from 'helpers/isFocusingElement';
import StampAnnotationBuilder from 'helpers/stampAnnotationBuilder';

import { canUseImageSignedUrl } from 'utils/documentUtil';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { TOOLS_NAME } from 'constants/toolsName';

const showStampToolPopper = () => {
  const element = document.querySelector("[data-element='stampToolButton']");
  element && element.click(); // trigger click to open popper when tool is disabled
};

/**
 * Handle pasting XFDF data from clipboard
 * @param {string} text - HTML text from clipboard
 * @returns {Promise<void>}
 */
const handlePasteXfdf = async (text) => {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(text, 'text/html');
  const spanEl = doc.querySelector('span[data-meta]');
  if (!spanEl) {
    return false;
  }

  const data = spanEl.dataset.meta;
  const base64Xfdf = data.replace(/<--\(lumin-data\)(.*?)\(\/lumin-data\)-->/, '$1');
  if (!base64Xfdf) {
    return false;
  }

  const xfdf = encoder.atob(base64Xfdf);
  const { copyId } = spanEl.dataset;

  if (copyId === core.getAnnotationManager().getCopiedAnnotations()[0]?.Id) {
    core.pasteCopiedAnnotations();
    return true;
  }

  const annots = await core.getAnnotationManager().importAnnotations(xfdf);
  annots.forEach((annot) => {
    annot.PageNumber = core.getCurrentPage();
    core.getAnnotationManager().redrawAnnotation(annot);
  });

  const commentHighlightSelected = annots.filter(
    (annot) => isComment(annot) && annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key)
  );
  const annotationsCannotModify = annots.filter((annot) => !core.canModify(annot));

  core.getAnnotationManager().deselectAnnotations([...commentHighlightSelected, ...annotationsCannotModify]);
  core.selectAnnotations(annots);
  core.updateCopiedAnnotations();
  core.getAnnotationManager().getCopiedAnnotations()[0].Id = spanEl.dataset.copyId;
  return true;
};

/**
 * Handle pasting image data from clipboard
 * @param {Blob} blob - Image blob from clipboard
 * @param {Object} state - Current application state
 * @returns {void}
 */
const handlePasteImage = async (blob, state) => {
  const currentUser = selectors.getCurrentUser(state);
  const currentDocument = selectors.getCurrentDocument(state);
  const isStampToolDisabled = getToolPopper({
    currentUser,
    currentDocument,
    toolName: TOOLS_NAME.STAMP,
    translator: i18next.t,
  }).title;

  const isInFormFieldCreationMode = core.getFormFieldCreationManager().isInFormFieldCreationMode();
  const isEditPdfMode = core.getContentEditManager().isInContentEditMode();

  if (!blob || isInFormFieldCreationMode || isEditPdfMode) {
    return false;
  }

  if (isStampToolDisabled) {
    showStampToolPopper();
    return false;
  }

  const builder = new StampAnnotationBuilder(blob);
  const isValidToUseSignedUrl = canUseImageSignedUrl();
  if (isValidToUseSignedUrl) {
    await builder.addUrlImageToDocument(currentDocument);
  } else {
    await builder.addBase64ImageToDocument();
  }
  return true;
};

export default (store) => async (e) => {
  const state = store.getState();
  const isModalOpen = selectors.isModalOpen(state);
  if (!isFocusingElement() && !isModalOpen) {
    e.preventDefault();
    if (core.isReadOnlyModeEnabled()) {
      return;
    }

    if ((isFirefox || isSafari) && core.getAnnotationManager().getCopiedAnnotations().length > 0) {
      core.pasteCopiedAnnotations();
      return;
    }

    const isInFormFieldCreationMode = core.getFormFieldCreationManager().isInFormFieldCreationMode();
    if (isInFormFieldCreationMode) {
      if (
        core
          .getAnnotationManager()
          .getCopiedAnnotations()
          .every((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation)
      ) {
        core.pasteCopiedAnnotations();
      }
      return;
    }

    const { items } = e.clipboardData || e.originalEvent.clipboardData;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const blob = item.getAsFile();
        const hasPasteImage = await handlePasteImage(blob, state);
        if (hasPasteImage) {
          return;
        }
      }
      if (item.type.indexOf('text/html') === 0) {
        const text = await new Promise((resolve) => {
          item.getAsString((text) => {
            resolve(text);
          });
        });
        const hasPasteXfdf = await handlePasteXfdf(text);
        if (hasPasteXfdf) {
          return;
        }
      }
    }
  }
};
