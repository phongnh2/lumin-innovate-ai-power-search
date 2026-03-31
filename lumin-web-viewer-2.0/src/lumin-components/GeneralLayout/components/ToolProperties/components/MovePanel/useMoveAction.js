import { useContext, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { v4 } from 'uuid';

import { enqueueSnackbar } from '@libs/snackbar';

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

const useMoveAction = () => {
  const {
    listPageDeleted,
    pageWillBeCropped,
    pageWillBeDeleted,
    setListPageDeleted,
    setPageWillBeDeleted,
    setPageWillBeCropped,
    bookmarkIns,
  } = useContext(ViewerContext);
  const [errorMessageFromField, setErrorMessageFromField] = useState('');
  const [errorMessageToField, setErrorMessageToField] = useState('');
  const dispatch = useDispatch();
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const thumbs = useSelector(selectors.getThumbs, shallowEqual);
  const { t } = useTranslation();

  const isValidPageNumber = (pageNumber) => {
    const totalPages = core.getTotalPages();
    return pageNumber > 0 && pageNumber <= totalPages;
  };

  const validateFieldsAndSetErrors = (from, to) => {
    const isFromValid = isValidPageNumber(parseInt(from));
    const isToValid = isValidPageNumber(parseInt(to));

    setErrorMessageFromField(isFromValid ? '' : t(ERROR_MESSAGE_INVALID_PAGE));
    setErrorMessageToField(isToValid ? '' : t(ERROR_MESSAGE_INVALID_PAGE));

    return isFromValid && isToValid;
  };

  const clearErrorMessages = () => {
    setErrorMessageFromField('');
    setErrorMessageToField('');
  };

  const checkPageEqual = (from, to) => from === to && to !== '';

  const showPageBlockedWarning = (pageNumber) => {
    enqueueSnackbar({
      message: t('modal.blockedPage', { page: pageNumber }),
      variant: 'warning',
    });
  };

  const updatePositionAfterMove = (from, to, currentPosition) => {
    if (from === currentPosition) {
      return to;
    }
    if (to <= currentPosition && from > currentPosition) {
      return currentPosition + 1;
    }
    if (to >= currentPosition && from < currentPosition) {
      return currentPosition - 1;
    }
    return currentPosition;
  };

  const updatePageOfManip = (from, to) => {
    const newListPageDeleted = {};
    Object.keys(listPageDeleted).forEach((key) => {
      const position = listPageDeleted[key];
      const newPosition = updatePositionAfterMove(from, to, position);
      listPageDeleted[key] = newPosition;
      newListPageDeleted[newPosition] = newPosition;
    });
    setListPageDeleted(newListPageDeleted);

    const newPageWillBeDeleted = updatePositionAfterMove(from, to, pageWillBeDeleted);
    if (newPageWillBeDeleted !== pageWillBeDeleted) {
      setPageWillBeDeleted(newPageWillBeDeleted);
    }

    const newCropPosition = updatePositionAfterMove(from, to, pageWillBeCropped.position);
    if (newCropPosition !== pageWillBeCropped.position) {
      setPageWillBeCropped({
        ...pageWillBeCropped,
        position: newCropPosition,
      });
    }
  };

  const updateThumbnails = async (from, to) => {
    const thumbsUpdate = [...thumbs];
    const thumbMove = await manipulationUtils.onLoadThumbs(to - 1);
    const thumbTemp = {
      ...thumbMove,
      ...thumbs[from - 1],
    };
    thumbsUpdate.splice(from - 1, 1);
    thumbsUpdate.splice(to - 1, 0, thumbTemp);
    dispatch(actions.updateThumbs(thumbsUpdate));
  };

  const executePageMove = async (from, to) => {
    const action = Manipulation.createMovePageAction(from, to);
    const manipulationId = v4();
    await documentServices.movePages({
      currentDocument,
      pagesToMove: from,
      insertBeforePage: to,
      manipulationId,
    });

    await OutlinePageManipulationUtils.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.MOVE_PAGE,
      movedOriginPage: from,
      manipulationPages: [to],
    });
    PageTracker.updateOnManipulationChanged({
      type: MANIPULATION_TYPE.MOVE_PAGE,
      movedOriginPage: from,
      manipulationPages: [to],
      manipulationId,
    });
    action.updateFormFieldChanged(currentDocument._id);
    updatePageOfManip(from, to);

    bookmarkIns.updatePositionOfBookmark({
      type: MANIPULATION_TYPE.MOVE_PAGE,
      option: { pagesToMove: from, insertBeforePage: to },
    });

    await updateThumbnails(from, to);
    clearErrorMessages();
  };

  const movePage = async (from, to) => {
    if (!from && !to) {
      return;
    }

    if (listPageDeleted[from]) {
      showPageBlockedWarning(from);
      return;
    }

    const isValid = validateFieldsAndSetErrors(from, to);
    if (!isValid || checkPageEqual(from, to)) {
      return;
    }

    await executePageMove(from, to);
  };

  return { movePage, errorMessageFromField, errorMessageToField, setErrorMessageFromField, setErrorMessageToField };
};

export default useMoveAction;
