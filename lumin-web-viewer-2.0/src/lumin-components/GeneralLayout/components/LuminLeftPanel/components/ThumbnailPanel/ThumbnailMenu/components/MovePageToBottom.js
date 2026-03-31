/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';

import core from 'core';

import ViewerContext from 'screens/Viewer/Context';

import { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';

import { useTranslation } from 'hooks';

import { CLICK_ACTION_EVENT_MAPPING } from '../../constants';
import usePagetoolActionFromThumbnail from '../../hooks/usePagetoolActionFromThumbnail';
import { ThumbnailMenuContext } from '../ThumbnailMenu';

export const MovePageToBottom = () => {
  const { t } = useTranslation();
  const { movePage, handleSendClickEvent, isOffline } = usePagetoolActionFromThumbnail();
  const { index, handleClose } = useContext(ThumbnailMenuContext);
  const { pageWillBeDeleted } = useContext(ViewerContext);
  const totalPages = pageWillBeDeleted === -1 ? core.getTotalPages() : core.getTotalPages() + 1;
  const disabled = index === totalPages - 1 || isOffline || core.getContentEditManager().isInContentEditMode();

  const onClick = () => {
    const callback = () => {
      handleClose();

      handleSendClickEvent(CLICK_ACTION_EVENT_MAPPING.movePageToBottom);

      setTimeout(() => {
        core.setCurrentPage(totalPages);
      }, 0);
    };

    movePage(index + 1, totalPages, callback);
  };

  return (
    <MenuItem icon="md_arrow_down-1" onClick={onClick} disabled={disabled}>
      {t('common.movePageToBottom')}
    </MenuItem>
  );
};

MovePageToBottom.propTypes = {};

export default MovePageToBottom;
