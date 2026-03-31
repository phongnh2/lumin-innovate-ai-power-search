import React, { useContext } from 'react';

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
      handleClose();
    };

    handleSendClickEvent(CLICK_ACTION_EVENT_MAPPING.insertBlankPageBelow);

    inserBlankPage({
      insertPosition: index + 2,
      callback,
    });
  };

  return (
    <MenuItem onClick={onClick} icon="md_insert_from_below" disabled={isOffline}>
      {t('common.inserBlankPageBelow')}
    </MenuItem>
  );
};

InsertBlankPageAbove.propTypes = {};

export default InsertBlankPageAbove;
