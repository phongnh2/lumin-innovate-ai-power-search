import { AnyAction } from 'redux';

import core from 'core';
import { store } from 'store';

import logger from 'helpers/logger';

import { manipulation } from 'utils';
import { completeSaveOperation, startSaveOperation } from 'utils/saveOperationUtils';

import { setIsUsingPageToolsWithAI } from 'features/EditorChatBot/slices';
import { OutlinePageManipulationUtils } from 'features/Outline/utils/outlinePageManipulation.utils';

import { MANIPULATION_TYPE, LOGGER } from 'constants/lumin-common';
import { SAVE_OPERATION_STATUS, SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';

export async function deletePage({
  pageRange,
  currentDocument,
}: {
  pageRange: number[];
  currentDocument: IDocumentBase;
}) {
  store.dispatch(setIsUsingPageToolsWithAI(true) as AnyAction);
  const operationId = startSaveOperation(store.dispatch, SAVE_OPERATION_TYPES.PAGE_TOOLS, {
    action: 'remove_pages',
    documentId: currentDocument._id,
  });
  try {
    const annotationManager = core.getAnnotationManager();
    const annotationDeleted = annotationManager
      .getAnnotationsList()
      .filter((annot) => pageRange.includes(annot.PageNumber));

    await core.removePages(pageRange);

    await manipulation.executeSocketRemovePage({
      currentDocument,
      pagesRemove: pageRange,
      annotationDeleted,
    });

    await OutlinePageManipulationUtils.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.REMOVE_PAGE,
      manipulationPages: pageRange,
    });

    completeSaveOperation(store.dispatch, operationId, {
      status: SAVE_OPERATION_STATUS.SUCCESS,
    });
    store.dispatch(setIsUsingPageToolsWithAI(false) as AnyAction);

    return `Successfully deleted ${pageRange.length} page(s): ${pageRange.join(', ')}`;
  } catch (error) {
    logger.logError({
      error: error as Error,
      reason: LOGGER.Service.EDITOR_CHATBOT,
    });
    completeSaveOperation(store.dispatch, operationId, {
      status: SAVE_OPERATION_STATUS.ERROR,
    });
    return `Failed to delete pages. Please try again.`;
  }
}
