/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { AnyAction } from 'redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import actions from 'actions';
import core from 'core';
import { store } from 'store';

import { executeWithCancellation } from 'utils/executeWithCancellation';
import { waitForEditBoxAvailable, startContentEditMode } from 'utils/setupEditBoxesListener';

import { CHATBOT_TOOL_NAMES } from 'features/EditorChatBot/constants';
import { toolCallingQueue } from 'features/EditorChatBot/utils/toolCallingQueue';

import { ANNOTATION_ACTION } from 'constants/documentConstants';

type TextDocumentPosition = { textToReplace: Set<string>; rects: Core.Math.Rect[] };

export async function findTextDocumentPosition(
  text: string,
  pages: number[]
): Promise<Map<number, TextDocumentPosition>> {
  return new Promise((resolve) => {
    const result = new Map<number, TextDocumentPosition>();
    const startPage = Math.min(...pages);
    const endPage = Math.max(...pages);
    const searchMode = window.Core.Search.Mode.HIGHLIGHT;
    core.textSearchInit(text, searchMode, {
      fullSearch: true,
      startPage,
      endPage,
      onResult: ({
        pageNum,
        resultStr,
        quads,
        resultCode,
      }: {
        pageNum: number;
        resultStr: string;
        quads: Core.Math.Quad[];
        resultCode: number;
      }) => {
        const foundResult = resultCode === window.Core.Search.ResultCode.FOUND;
        if (foundResult) {
          if (!result.has(pageNum)) {
            result.set(pageNum, { textToReplace: new Set<string>(), rects: new Array<Core.Math.Rect>() });
          }
          const rect = window.Core.Math.Rect.combineRects(
            quads.map(({ x1, y1, x2, y2 }) => new window.Core.Math.Rect(x1, y1, x2, y2))
          );
          const { rects, textToReplace } = result.get(pageNum);
          rects.push(rect);
          textToReplace.add(resultStr);
        }
      },
      onDocumentEnd: () => {
        resolve(result);
      },
    });
  });
}

/**
 * Wraps a promise and ensures it resolves only after both the original promise completes
 * AND the 'pagesUpdated' event has fired.
 *
 * @param promise - The original promise to wait for
 * @returns A new promise that resolves after both conditions are met
 */
function withWaitForPageUpdated(promise: Promise<void>) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    let promiseResolved = false;
    let pageUpdated = false;

    const onPagesUpdated = ({ contentChanged }: { contentChanged: number[] }) => {
      if (contentChanged.length !== 1 || contentChanged[0] !== core.getCurrentPage()) {
        return;
      }
      core.removeEventListener('pagesUpdated', onPagesUpdated);
      pageUpdated = true;
      if (promiseResolved) {
        resolve(1);
      }
    };

    core.addEventListener('pagesUpdated', onPagesUpdated);

    await promise;
    promiseResolved = true;

    if (pageUpdated) {
      resolve(1);
    }
    // Otherwise, we'll wait for the onPagesUpdated callback to resolve
  });
}

export function setToRegex(stringSet: Set<string>): RegExp {
  // Convert set to array and escape special regex characters
  const escapedStrings = Array.from(stringSet).map((str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(escapedStrings.join('|'), 'gi');
}

export function replaceText(oldContent: string, oldText: Set<string>, newText: string) {
  const regex = setToRegex(oldText);
  return oldContent
    .replaceAll(regex, newText)
    .replaceAll('&amp;lt;/strong&amp;gt;', '</strong>')
    .replaceAll('&amp;lt;strong&amp;gt;', '<strong>')
    .replaceAll('&amp;lt;br&amp;gt;', '<br>')
    .replaceAll('&lt;/span&gt;', '</span>')
    .replaceAll('&lt;span', '<span')
    .replaceAll('&amp;lt;/u&amp;gt;', '</u>')
    .replaceAll('&amp;lt;u&amp;gt;', '<u>')
    .replaceAll('&amp;lt;/em&amp;gt;', '</em>')
    .replaceAll('&amp;lt;em&amp;gt;', '<em>')
    .replaceAll('&gt;', '>');
}

export async function waitAndGetEditBoxAnnot(rects: Core.Math.Rect[]) {
  let editBoxAnnot: Core.Annotations.Annotation[] | undefined;
  await new Promise((finishWait) => {
    const onAnnotationChanged = (
      annotations: Core.Annotations.Annotation[],
      action: typeof ANNOTATION_ACTION[keyof typeof ANNOTATION_ACTION]
    ) => {
      if (action === ANNOTATION_ACTION.ADD) {
        editBoxAnnot = annotations.filter(
          (annot) => annot.isContentEditPlaceholder() && rects.some((rect) => annot.getRect().intersects(rect))
        );
        if (editBoxAnnot) {
          core.getAnnotationManager().removeEventListener('annotationChanged', onAnnotationChanged);
          finishWait(1);
        }
      }
    };
    core.getAnnotationManager().addEventListener('annotationChanged', onAnnotationChanged);
  });
  return editBoxAnnot;
}

export async function handleReplaceDocumentText(
  editBoxAnnots: Core.Annotations.Annotation[],
  oldText: Set<string>,
  newText: string
) {
  const mapTextAnnots = new WeakMap<Core.Annotations.Annotation, Core.Annotations.TextMarkupAnnotation[]>();
  core.getAnnotationsList().forEach((annot) => {
    if (
      annot instanceof window.Core.Annotations.TextMarkupAnnotation &&
      annot.PageNumber === editBoxAnnots[0].PageNumber
    ) {
      const textbox = editBoxAnnots.find((editBoxAnnot) => annot.getRect().intersects(editBoxAnnot.getRect()));
      if (textbox) {
        if (mapTextAnnots.has(textbox)) {
          const array = mapTextAnnots.get(textbox);
          array.push(annot);
        } else {
          mapTextAnnots.set(textbox, [annot]);
        }
      }
    }
  });
  for (const editBoxAnnot of editBoxAnnots) {
    const oldWidth = Math.ceil(editBoxAnnot.Width);
    const oldContent = await window.Core.ContentEdit.getDocumentContent(
      editBoxAnnot as Core.Annotations.RectangleAnnotation
    );
    const newContent = replaceText(oldContent, oldText, newText);
    if (mapTextAnnots.has(editBoxAnnot)) {
      mapTextAnnots
        .get(editBoxAnnot)
        .forEach((textAnnot: Core.Annotations.TextMarkupAnnotation & { TemporaryNoDelete?: boolean }) => {
          textAnnot.NoDelete = true;
          textAnnot.TemporaryNoDelete = true;
        });
    }
    await withWaitForPageUpdated(
      window.Core.ContentEdit.updateDocumentContent(
        editBoxAnnot as Core.Annotations.RectangleAnnotation,
        newContent,
        false
      )
    );
    /*
      Increase annotation width by 5% to provide additional space for the new content
      This prevents text wrapping issues that occur when replacing text in the annotation
    */
    await withWaitForPageUpdated(
      new Promise((resolve) => {
        editBoxAnnot.Width = oldWidth * 1.05;
        core.getAnnotationManager().redrawAnnotation(editBoxAnnot);
        core.getAnnotationManager().trigger('annotationChanged', [[editBoxAnnot], 'modify', {}]);
        resolve();
      })
    );
    core.getContentEditManager().trigger('contentBoxEditedByAI');
  }
}

function getEditBoxAnnotationsOnPage(page: number) {
  return core.getAnnotationsList().filter((annot) => annot.isContentEditPlaceholder() && annot.PageNumber === page);
}

async function handleExistingEditBoxAnnotations({
  page,
  data,
  newText,
  signal,
}: {
  page: number;
  data: TextDocumentPosition;
  newText: string;
  signal?: AbortSignal;
}) {
  const editBoxAnnots = getEditBoxAnnotationsOnPage(page);
  if (!editBoxAnnots.length) {
    return;
  }
  const editBoxAnnot = core
    .getAnnotationsList()
    .filter((annot) => annot.isContentEditPlaceholder() && data.rects.some((rect) => annot.getRect().intersects(rect)));
  core.setCurrentPage(page);
  await executeWithCancellation({
    callback: handleReplaceDocumentText,
    signal,
  })(editBoxAnnot, data.textToReplace, newText);
}

function setupContentEditMode() {
  const { dispatch } = store;
  dispatch(actions.setIsToolPropertiesOpen(true) as AnyAction);
  dispatch(actions.setToolPropertiesValue(TOOL_PROPERTIES_VALUE.EDIT_PDF) as AnyAction);
  dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.EDIT_PDF.value) as AnyAction);
  dispatch(actions.setDiscardContentEdit(false) as AnyAction);
  dispatch(actions.setIsInContentEditMode(true) as AnyAction);
  core.fitToPage();
}

async function findOrCreateEditBoxAnnotation(page: number, rects: Core.Math.Rect[], signal?: AbortSignal) {
  let editBoxAnnot = core
    .getAnnotationsList()
    .filter(
      (annot) =>
        annot.isContentEditPlaceholder() &&
        annot.PageNumber === page &&
        rects.some((rect) => annot.getRect().intersects(rect))
    );

  if (!editBoxAnnot.length) {
    editBoxAnnot = await executeWithCancellation({
      callback: waitAndGetEditBoxAnnot,
      signal,
    })(rects);
  }

  return editBoxAnnot;
}

async function handleNewEditBoxCreation({
  page,
  data,
  newText,
  signal,
}: {
  page: number;
  data: TextDocumentPosition;
  newText: string;
  signal?: AbortSignal;
}) {
  const editBoxAnnots = getEditBoxAnnotationsOnPage(page);
  if (editBoxAnnots.length) {
    return;
  }
  await new Promise((resolve) => {
    core.setCurrentPage(page);

    const onEditBoxesAvailable = async () => {
      if (toolCallingQueue.getStatus().isPaused) {
        return;
      }
      const matchedEditBoxAnnots = await executeWithCancellation({
        callback: findOrCreateEditBoxAnnotation,
        signal,
      })(page, data.rects, signal);

      await executeWithCancellation({
        callback: handleReplaceDocumentText,
        signal,
      })(matchedEditBoxAnnots, data.textToReplace, newText);
      resolve(1);
    };
    waitForEditBoxAvailable(onEditBoxesAvailable, { once: true });
    if (!core.getContentEditManager().isInContentEditMode()) {
      startContentEditMode();
      setupContentEditMode();
    }
  });
}

export function handleReplaceTextForDocumentContent(
  pageTexts: Map<number, TextDocumentPosition>,
  newText: string,
  signal?: AbortSignal
) {
  for (const [page, data] of pageTexts) {
    toolCallingQueue.addTask(handleExistingEditBoxAnnotations, CHATBOT_TOOL_NAMES.EDIT_TEXT, {
      page,
      newText,
      data,
      signal,
    });
    toolCallingQueue.addTask(handleNewEditBoxCreation, CHATBOT_TOOL_NAMES.EDIT_TEXT, { page, newText, data, signal });
  }
}
