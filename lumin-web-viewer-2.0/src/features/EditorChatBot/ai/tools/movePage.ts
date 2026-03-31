import { AnyAction } from 'redux';

import { store } from 'store';

import documentServices from 'services/documentServices';

import logger from 'helpers/logger';

import { Manipulation } from 'features/DocumentFormBuild/manipulation';
import { setIsUsingPageToolsWithAI } from 'features/EditorChatBot/slices';
import { OutlinePageManipulationUtils } from 'features/Outline/utils/outlinePageManipulation.utils';

import { LOGGER, MANIPULATION_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

export const movePage = async ({
  current,
  target,
  currentDocument,
}: {
  current: number;
  target: number;
  currentDocument: IDocumentBase;
}) => {
  try {
    store.dispatch(setIsUsingPageToolsWithAI(true) as AnyAction);
    const action = Manipulation.createMovePageAction(current, target);

    await documentServices.movePages({
      currentDocument,
      pagesToMove: current,
      insertBeforePage: target,
    });

    await OutlinePageManipulationUtils.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.MOVE_PAGE,
      movedOriginPage: current,
      manipulationPages: [target],
    });

    await action.updateFormFieldChanged(currentDocument._id);

    store.dispatch(setIsUsingPageToolsWithAI(false) as AnyAction);

    return `Successfully moved page ${current} to position ${target}.`;
  } catch (error) {
    logger.logError({
      error: error as Error,
      reason: LOGGER.Service.EDITOR_CHATBOT,
    });
    store.dispatch(setIsUsingPageToolsWithAI(false) as AnyAction);
    return `Failed to move page. Please try again.`;
  }
};
