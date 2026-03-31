import cloneDeep from 'lodash/cloneDeep';
import { useContext } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ViewerContext from 'screens/Viewer/Context';

import { useTranslation } from 'hooks';

import documentServices from 'services/documentServices';

import logger from 'helpers/logger';

import { validator, manipulation, eventTracking, toastUtils } from 'utils';

import UserEventConstants from 'constants/eventConstants';
import { LOGGER } from 'constants/lumin-common';
import { PAGES_TOOL_ERROR_MESSAGE } from 'constants/messages';

const useRotateAction = () => {
  const { listPageDeleted } = useContext(ViewerContext);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const thumbs = useSelector(selectors.getThumbs, shallowEqual);

  const fireEvent = (pagesToRotate, from = '', to = '') => {
    eventTracking(UserEventConstants.EventType.DOCUMENT_ROTATED, {
      pagesToRotate,
      pagesFrom: from,
      pagesTo: to,
    });
  };

  const checkPageLocked = (rotatePages) => {
    const listPageLocked = [];
    rotatePages.forEach((page) => {
      if (listPageDeleted[page]) {
        listPageLocked.push(page);
      }
    });

    return listPageLocked;
  };

  const checkPageWithTotalPage = (input) => {
    const _totalPages = core.getTotalPages();
    return input <= _totalPages;
  };

  const validatePageInput = (value) => {
    const validation = /^\d+(?:,\d+)*$/g;
    const splittedPage = value.split(',').map(Number);
    if (!validation.test(value)) {
      return t(PAGES_TOOL_ERROR_MESSAGE.MAKE_SURE_ABOVE_FORMAT);
    }
    if (!value || !splittedPage.every(validator.validateInputPages)) {
      return t(PAGES_TOOL_ERROR_MESSAGE.INVALID_PAGE_POSITION);
    }
    if (!splittedPage.every(checkPageWithTotalPage)) {
      return t(PAGES_TOOL_ERROR_MESSAGE.GREATER_THAN_TOTAL_PAGE);
    }
    return '';
  };

  const rotatePages = async (pageIndexes, angle) => {
    const listPageLocked = checkPageLocked(pageIndexes);
    if (!listPageLocked.length) {
      try {
        if (currentDocument.isSystemFile) {
          dispatch(actions.setCurrentDocument({ ...currentDocument, unsaved: true }));
        }
        await documentServices.rotatePages({ currentDocument, pageIndexes, angle });
        const thumbsUpdate = cloneDeep(thumbs);
        await Promise.all(
          pageIndexes.map(async (pageIndex) => {
            if (pageIndex <= thumbsUpdate.length) {
              const index = pageIndex - 1;
              const thumbRotate = await manipulation.onLoadThumbs(index);
              thumbsUpdate[index] = thumbRotate;
              thumbsUpdate[index].id = thumbs[index].id;
            }
          })
        );
        dispatch(actions.updateThumbs(thumbsUpdate));
      } catch (error) {
        logger.logError({
          reason: LOGGER.EVENT.PDFTRON_CORE_DOCUMENT,
          error,
        });
      }
    } else {
      let pageLocked = '';
      listPageLocked.forEach((page) => (pageLocked += `${page} `));
      const toastSetting = {
        message: t('viewer.leftPanelEditMode.pagePageLockedIsBlocked', { pageLocked }),
        top: 130,
      };
      toastUtils.warn(toastSetting);
    }
  };

  const rotateByPages = (dir, pagesToRotate) => {
    if (!pagesToRotate.length) {
      const listAllPages = [];
      const totalPages = core.getTotalPages();
      for (let page = 0; page < totalPages; page++) {
        if (!listPageDeleted[page + 1]) {
          listAllPages.push(page + 1);
        }
      }
      rotatePages(listAllPages, dir);
      fireEvent(listAllPages.toString());
    } else {
      const error = validatePageInput(pagesToRotate);
      if (!error) {
        const pagesToRotateArr = pagesToRotate.split(',').map(Number);
        rotatePages(pagesToRotateArr, dir);
        fireEvent(pagesToRotate.toString());
      }
    }
  };

  const rotateByRange = (directionValue, from, to) => {
    if (validatePageInput(from) || validatePageInput(to)) {
      return;
    }

    const arr = [];
    const _from = Math.min(from, to);
    const _to = Math.max(from, to);
    for (let page = _from; page < _to + 1; page++) {
      if (!listPageDeleted[page]) {
        arr.push(page);
      }
    }
    rotatePages(arr, directionValue);
    fireEvent(arr.toString(), from, to);
  };

  return { rotateByPages, rotateByRange, validatePageInput };
};

export default useRotateAction;
