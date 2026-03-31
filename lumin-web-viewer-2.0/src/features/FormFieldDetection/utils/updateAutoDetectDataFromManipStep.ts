import produce from 'immer';

import selectors from 'selectors';
import { store } from 'store';

import indexedDBService from 'services/indexedDBService';

import logger from 'helpers/logger';

import { PageManipulationType, ManipChangedParams } from 'features/PageTracker/types/pageTracker.type';
import { PageManipulation } from 'features/PageTracker/utils/pageManipulation';

import { LOGGER, MANIPULATION_TYPE } from 'constants/lumin-common';

type ManipStep = {
  id: string;
  type: PageManipulationType;
  option: {
    insertBeforePage?: number;
    pagesToMove?: number;
    pagesRemove?: number[];
    insertPages?: number[];
  };
};

export const updateAutoDetectDataFromManipStep = async (manipulationSteps: Array<Record<string, unknown>>) => {
  try {
    const currentDocument = selectors.getCurrentDocument(store.getState());
    if (!currentDocument) {
      return;
    }

    const documentId = currentDocument._id;
    let data = await indexedDBService.getAutoDetectFormFields(documentId, []);
    if (!data.predictions) {
      return;
    }

    const appliedManipStepIds = data.manipStepIds || [];
    let shouldUpdate = false;
    // eslint-disable-next-line no-restricted-syntax
    for (const manipStep of manipulationSteps) {
      const { id, type, option } = manipStep as ManipStep;
      if (appliedManipStepIds.includes(manipStep.id as string)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const processedPages = Object.keys(data.predictions || {}).map(Number);
      const params: ManipChangedParams & { id: string } = {
        type,
        id,
        manipulationPages: null,
        manipulationId: id,
      };
      switch (type) {
        case MANIPULATION_TYPE.INSERT_BLANK_PAGE: {
          const { insertPages } = option;
          params.manipulationPages = insertPages;
          break;
        }
        case MANIPULATION_TYPE.REMOVE_PAGE: {
          const { pagesRemove } = option;
          params.manipulationPages = pagesRemove;
          break;
        }
        case MANIPULATION_TYPE.MOVE_PAGE: {
          const { pagesToMove, insertBeforePage } = option;
          params.manipulationPages = [insertBeforePage];
          params.movedOriginPage = pagesToMove;
          break;
        }
        default:
          break;
      }

      if (!params.manipulationPages) {
        return;
      }

      shouldUpdate = true;
      const pageMapper = PageManipulation.MANIPULATION_HANDLERS[type]({
        originalPages: Array.from(processedPages),
        manipulationData: {
          manipulationPages: params.manipulationPages,
          movedOriginPage: params.movedOriginPage,
          mergedPagesCount: params.mergedPagesCount,
        },
      });

      const updatedData = produce(data, (draft) => {
        const originalManipStepIdsSet = new Set(draft.manipStepIds || []);
        if (!draft.predictions) {
          draft.predictions = {};
        }

        if (id) {
          originalManipStepIdsSet.add(id);
          draft.manipStepIds = Array.from(originalManipStepIdsSet);
        }

        Object.keys(draft.predictions || {})
          .map(Number)
          .sort((a, b) => b - a)
          .forEach((pageNumber) => {
            const mappedPage = pageMapper.get(pageNumber);
            if (mappedPage === null) {
              delete draft.predictions[pageNumber];
              return;
            }

            if (mappedPage && pageNumber !== mappedPage) {
              draft.predictions[mappedPage] = draft.predictions[pageNumber] || [];
              delete draft.predictions[pageNumber];
            }
          });
      });

      data = updatedData;
    }

    if (shouldUpdate) {
      await indexedDBService.updateAutoDetectFormFields(documentId, data);
    }
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
      message: 'Error updating auto detect form field data from manipulation step',
      error: error as Error,
    });
  }
};
