import React, { useContext } from 'react';

import core from 'core';

import { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';

import { useTranslation } from 'hooks';

import { CLICK_ACTION_EVENT_MAPPING } from '../../constants';
import usePagetoolActionFromThumbnail from '../../hooks/usePagetoolActionFromThumbnail';
import { ThumbnailMenuContext } from '../ThumbnailMenu';

export const InsertBlankPageAbove = () => {
  const { t } = useTranslation();
  const { inserBlankPage, handleSendClickEvent, isOffline } = usePagetoolActionFromThumbnail();
  const { index, handleClose } = useContext(ThumbnailMenuContext);

  const onClick = () => {
    const callback = () => {
      core.setCurrentPage(index + 2);
      handleClose();
    };

    handleSendClickEvent(CLICK_ACTION_EVENT_MAPPING.insertBlankPageAbove);

    inserBlankPage({
      insertPosition: index + 1,
      callback,
    });
  };

  return (
    <MenuItem onClick={onClick} icon="md_insert_from_above" disabled={isOffline}>
      {t('common.inserBlankPageAbove')}
    </MenuItem>
  );
};

InsertBlankPageAbove.propTypes = {};

export default InsertBlankPageAbove;
