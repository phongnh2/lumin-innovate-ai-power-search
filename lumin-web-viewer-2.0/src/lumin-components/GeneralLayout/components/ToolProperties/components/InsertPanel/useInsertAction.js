import { useContext } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import v4 from 'uuid/v4';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ViewerContext from 'screens/Viewer/Context';

import { useTranslation } from 'hooks/useTranslation';

import documentServices from 'services/documentServices';

import manipulationUtils from 'utils/manipulation';

import { Manipulation } from 'features/DocumentFormBuild';
import { OutlinePageManipulationUtils } from 'features/Outline/utils/outlinePageManipulation.utils';
import { PageTracker } from 'features/PageTracker/utils/pageTracker';

import { MANIPULATION_TYPE } from 'constants/lumin-common';
import { ERROR_MESSAGE_INVALID_PAGE } from 'constants/messages';

import { SELECT_VALUE } from '../MergePanel/constants';

const MAXIMUM_INSERT_PAGE_COUNT = 100;

const useInsertAction = ({ setPageLocationError, setPagesError }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);

  const {
    listPageDeleted,
    pageWillBeCropped,
    pageWillBeDeleted,
    setListPageDeleted,
    setPageWillBeDeleted,
    setPageWillBeCropped,
    bookmarkIns,
  } = useContext(ViewerContext);

  const validatePositionPage = (position) => {
    const totalPages = core.getTotalPages();
    const pagePositionInt = parseInt(position);
    return pagePositionInt <= totalPages && pagePositionInt > 0;
  };

  const validatePageCount = (numberOfPages) => numberOfPages <= MAXIMUM_INSERT_PAGE_COUNT && numberOfPages > 0;

  const updatePageOfManip = (insertPosition) => {
    const offset = insertPosition.length;
    const _listPageDeleted = {};
    Object.keys(listPageDeleted).forEach((key) => {
      if (listPageDeleted[key] >= insertPosition) {
        listPageDeleted[key] += offset;
      }
      _listPageDeleted[listPageDeleted[key]] = listPageDeleted[key];
    });

    setListPageDeleted(_listPageDeleted);

    if (insertPosition <= pageWillBeCropped.position) {
      setPageWillBeCropped({
        ...pageWillBeCropped,
        position: pageWillBeCropped.position + offset,
      });
    }

    if (insertPosition <= pageWillBeDeleted) {
      setPageWillBeDeleted(pageWillBeDeleted + offset);
    }
  };

  const insertThumbnailsToGridView = async (insertIndex, numberOfPages) => {
    const blankThumbnails = await Promise.all(
      Array.from({ length: numberOfPages }).map(async (_, idx) => ({
        ...(await manipulationUtils.onLoadThumbs(insertIndex - 1 + idx)),
        id: v4(),
      }))
    );
    dispatch(actions.insertBlankThumbnails({ blankThumbnails, from: insertIndex - 1 }));
  };

  const handleInserBlankPage = async ({ position, beforeOrAfter, numberOfPages }) => {
    const totalPages = pageWillBeDeleted === -1 ? core.getTotalPages() : core.getTotalPages() + 1;
    const insertIndex = beforeOrAfter === SELECT_VALUE.BEFORE ? Number(position) : Number(position) + 1;
    const insertPositions = Array(numberOfPages).fill(insertIndex);

    const action = Manipulation.createInsertPageAction(insertPositions);
    const manipulationId = v4();
    await documentServices.insertBlankPages({
      currentDocument,
      insertPages: insertPositions,
      totalPages,
      sizePage: {
        width: 612,
        height: 792,
      },
      manipulationId,
    });
    await OutlinePageManipulationUtils.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
      manipulationPages: insertPositions,
    });
    PageTracker.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
      manipulationPages: insertPositions,
      manipulationId,
    });
    action.updateFormFieldChanged(currentDocument._id);
    bookmarkIns.updatePositionOfBookmark({
      type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
      option: {
        insertPages: insertPositions,
      },
    });
    updatePageOfManip(insertPositions);
    await insertThumbnailsToGridView(insertIndex, numberOfPages);
  };

  const handleInsertMultiplePages = async ({ position, beforeOrAfter, numberOfPages }) => {
    if (!validatePositionPage(position)) {
      setPageLocationError(t(ERROR_MESSAGE_INVALID_PAGE));
      return;
    }

    if (!validatePageCount(Number(numberOfPages))) {
      setPagesError(`Number of pages must be no more than ${MAXIMUM_INSERT_PAGE_COUNT}`);
      return;
    }

    await handleInserBlankPage({ position, beforeOrAfter, numberOfPages: Number(numberOfPages) });
  };

  return { handleInserBlankPage: handleInsertMultiplePages };
};

export default useInsertAction;
