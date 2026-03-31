/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';

import core from 'core';

import { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';

import { useTranslation } from 'hooks';

import { CLICK_ACTION_EVENT_MAPPING } from '../../constants';
import usePagetoolActionFromThumbnail from '../../hooks/usePagetoolActionFromThumbnail';
import { ThumbnailMenuContext } from '../ThumbnailMenu';

export const MovePageToTop = () => {
  const { t } = useTranslation();
  const { movePage, handleSendClickEvent, isOffline } = usePagetoolActionFromThumbnail();
  const { index, handleClose } = useContext(ThumbnailMenuContext);
  const disabled = index === 0 || isOffline || core.getContentEditManager().isInContentEditMode();

  const onClick = () => {
    const callback = () => {
      handleClose();

      handleSendClickEvent(CLICK_ACTION_EVENT_MAPPING.movePageToTop);

      setTimeout(() => {
        core.setCurrentPage(1);
      }, 0);
    };

    movePage(index + 1, 1, callback);
  };

  return (
    <MenuItem icon="md_arrow_up-1" onClick={onClick} disabled={disabled}>
      {t('common.movePageToTop')}
    </MenuItem>
  );
};

MovePageToTop.propTypes = {};

export default MovePageToTop;
