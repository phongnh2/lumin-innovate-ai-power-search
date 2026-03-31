import React, { useContext } from 'react';

import core from 'core';

import { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';

import { useTranslation } from 'hooks';

import { CLICK_ACTION_EVENT_MAPPING, ROTATE_DIRECTION } from '../../constants';
import usePagetoolActionFromThumbnail from '../../hooks/usePagetoolActionFromThumbnail';
import { ThumbnailMenuContext } from '../ThumbnailMenu';

export const RotateCounterclockwise = () => {
  const { t } = useTranslation();
  const { rotate, handleSendClickEvent } = usePagetoolActionFromThumbnail();
  const { index, handleClose } = useContext(ThumbnailMenuContext);
  const disabled = core.getContentEditManager().isInContentEditMode();

  const onClick = () => {
    const callback = () => {
      handleClose();
    };

    handleSendClickEvent(CLICK_ACTION_EVENT_MAPPING.rotateCounterclockwise);

    rotate({
      page: index + 1,
      angle: ROTATE_DIRECTION.LEFT,
      callback,
    });
  };

  return (
    <MenuItem onClick={onClick} icon="md_rotate_counter_clockwise" disabled={disabled}>
      {t('common.rotateCounterClockwise')}
    </MenuItem>
  );
};

RotateCounterclockwise.propTypes = {};

export default RotateCounterclockwise;
