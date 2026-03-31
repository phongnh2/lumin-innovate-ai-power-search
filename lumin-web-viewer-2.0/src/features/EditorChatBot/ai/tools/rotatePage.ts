import { cloneDeep } from 'lodash';
import { AnyAction } from 'redux';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import documentServices from 'services/documentServices';

import logger from 'helpers/logger';

import manipulation from 'utils/manipulation';

import { setIsUsingPageToolsWithAI } from 'features/EditorChatBot/slices';

import { LOGGER } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

const angleToPageRotation = (angle: number): Core.PageRotation => {
  switch (angle) {
    case 90:
      return window.Core.PageRotation.E_90;
    case 180:
      return window.Core.PageRotation.E_180;
    case 270:
      return window.Core.PageRotation.E_270;
    case 360:
    case 0:
      return window.Core.PageRotation.E_0;
    default:
      throw new Error(`Invalid rotation angle: ${angle}`);
  }
};

export const rotatePage = async ({
  pages,
  angles,
  currentDocument,
}: {
  pages: number[];
  angles: number[];
  currentDocument: IDocumentBase;
}) => {
  try {
    store.dispatch(setIsUsingPageToolsWithAI(true) as AnyAction);

    const angleGroups: Record<number, number[]> = {};

    pages.forEach((pageNumber, i) => {
      const angle = angles[i];
      if (!angleGroups[angle]) {
        angleGroups[angle] = [];
      }
      angleGroups[angle].push(pageNumber);
    });

    await Promise.all(
      Object.entries(angleGroups).map(async ([angle, pageNumbers]) => {
        const numAngle = Number(angle);
        const pageRotation = angleToPageRotation(numAngle);

        await documentServices.rotatePages({
          currentDocument,
          pageIndexes: pageNumbers,
          angle: pageRotation,
        });

        const isPageEditMode = selectors.isPageEditMode(store.getState());
        if (isPageEditMode) {
          const currentThumbnails = selectors.getThumbs(store.getState());
          const updatedThumbnails = cloneDeep(currentThumbnails);
          await Promise.all(
            pageNumbers.map(async (pageNumber) => {
              if (pageNumber <= currentThumbnails.length) {
                const index = pageNumber - 1;
                const rotatedThumbnail = await manipulation.onLoadThumbs(index);
                updatedThumbnails[index] = rotatedThumbnail;
                updatedThumbnails[index].id = currentThumbnails[index].id;
              }
            })
          );
          store.dispatch(actions.updateThumbs(updatedThumbnails) as AnyAction);
        }
      })
    );

    store.dispatch(setIsUsingPageToolsWithAI(false) as AnyAction);
    return 'Successfully rotated pages';
  } catch (error) {
    store.dispatch(setIsUsingPageToolsWithAI(false) as AnyAction);
    logger.logError({
      error: error as Error,
      reason: LOGGER.Service.EDITOR_CHATBOT,
    });
    return 'Failed to rotate pages. Please try again.';
  }
};
