import { ToolName } from 'core/type';

import core from 'core';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';
import TOOLS_NAME from 'constants/toolsName';

import fireEvent from './fireEvent';
import logger from './logger';

const WAIT_CONTENT_UPDATE_TIMEOUT = 5 * 60 * 1000;
class PageContentUpdatedListener {

  queue: number[];

  timeout: ReturnType<typeof setTimeout> | null;

  annot: Core.Annotations.RectangleAnnotation;

  editingContent: string;

  constructor() {
    this.queue = [];
  }

  contentBoxEditStarted = async (contentBox: Record<string, unknown>) => {
    try {
      const { editor: _, ...rest } = contentBox;
      const annot = Object.values(rest).find(
        (value: unknown) => value instanceof window.Core.Annotations.RectangleAnnotation
      );
      if (!annot) {
        return;
      }
      this.annot = annot;
      this.editingContent = await window.Core.ContentEdit.getDocumentContent(annot);
      this.queue.push(annot.PageNumber);
    } catch (error: unknown) {
      logger.logError({
        error,
        reason: LOGGER.Service.PDFTRON,
      });
    }
  };

  contentBoxEditEnded = async () => {
    try {

      if (!this.annot && typeof this.editingContent === 'undefined') {
        return;
      }
      const content = await window.Core.ContentEdit.getDocumentContent(this.annot);
      // need to remove page from queue if user don't edit text box
      if (content === this.editingContent) {
        this.removePageFromQueue(this.annot.PageNumber);
      }
      this.annot = undefined;
      this.editingContent = undefined;
    } catch (error: unknown) {
      logger.logError({
        error,
        reason: LOGGER.Service.PDFTRON,
      });
    }
  };

  onAddParagraph = (annot: Core.Annotations.Annotation) => {
    this.queue.push(annot.PageNumber);
  };

  onPagesUpdated = (changes: Core.DocumentViewer.pagesUpdatedChanges) => {
    const isInContentEditMode = core.getContentEditManager().isInContentEditMode();
    const { contentChanged } = changes;
    if (contentChanged.length !== 1 || !this.queue.length || !isInContentEditMode) {
      return;
    }
    this.removePageFromQueue(contentChanged[0]);
  };

  onAnnotationChanged = (annotations: Core.Annotations.Annotation[], action: string, objectInfo: { source: string }) => {
    const isInContentEditMode = core.getContentEditManager().isInContentEditMode();
    const isContentEditPlaceholder = annotations.some((annot: Core.Annotations.Annotation) =>
      annot.isContentEditPlaceholder()
    );
    if (
      action !== ANNOTATION_ACTION.ADD &&
      isContentEditPlaceholder &&
      isInContentEditMode &&
      objectInfo.source !== 'contentEditTool'
    ) {
      this.queue.push(annotations[0].PageNumber);
    }
  };

  private removePageFromQueue(pageNumber: number) {
    const index = this.queue.indexOf(pageNumber);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
    if (!this.queue.length) {
      fireEvent(CUSTOM_EVENT.PAGE_CONTENT_UPDATED_EDIT_PDF);
    }
  }

  addEventListener() {
    const addParagraphTool = core.getTool(TOOLS_NAME.ADD_PARAGRAPH as ToolName);
    core.addEventListener('pagesUpdated', this.onPagesUpdated);
    core.addEventListener('contentBoxEditStarted', this.contentBoxEditStarted);
    core.addEventListener('contentBoxEditEnded', this.contentBoxEditEnded);
    addParagraphTool.addEventListener('annotationAdded', this.onAddParagraph);
    core.addEventListener('annotationChanged', this.onAnnotationChanged);
  }

  removeEventListener() {
    const addParagraphTool = core.getTool(TOOLS_NAME.ADD_PARAGRAPH as ToolName);
    core.removeEventListener('pagesUpdated', this.onPagesUpdated);
    core.removeEventListener('contentBoxEditStarted', this.contentBoxEditStarted);
    core.removeEventListener('contentBoxEditEnded', this.contentBoxEditEnded);
    addParagraphTool.removeEventListener('annotationAdded', this.onAddParagraph);
    core.removeEventListener('annotationChanged', this.onAnnotationChanged);
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  isProcessingUpdateContent() {
    return this.queue.length > 0;
  }

  waitForUpdateContent() {
    return new Promise((resolve) => {
      if (!this.isProcessingUpdateContent()) {
        resolve(this);
      }
      this.timeout = setTimeout(() => {
        resolve(this);
      }, WAIT_CONTENT_UPDATE_TIMEOUT);
      window.addEventListener(
        CUSTOM_EVENT.PAGE_CONTENT_UPDATED_EDIT_PDF,
        () => {
          clearTimeout(this.timeout);
          this.timeout = null;
          resolve(this);
        },
        { once: true }
      );
    });
  }
}

export const pageContentUpdatedListener = new PageContentUpdatedListener();