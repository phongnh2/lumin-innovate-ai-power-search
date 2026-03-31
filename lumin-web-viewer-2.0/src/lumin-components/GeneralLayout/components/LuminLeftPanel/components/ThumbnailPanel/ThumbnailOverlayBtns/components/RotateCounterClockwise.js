import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React from 'react';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import { CLICK_ACTION_EVENT_MAPPING, ROTATE_DIRECTION } from '../../constants';
import usePagetoolActionFromThumbnail from '../../hooks/usePagetoolActionFromThumbnail';

export const RotateCounterClockwise = ({ index }) => {
  const { rotate, handleSendClickEvent } = usePagetoolActionFromThumbnail();
  const { t } = useTranslation();

  const onClick = () => {
    rotate({
      page: index + 1,
      angle: ROTATE_DIRECTION.LEFT,
    });
    handleSendClickEvent(CLICK_ACTION_EVENT_MAPPING.rotateCounterclockwiseFromOverlayBtn);
  };

  const _onClick = debounce(onClick, 300);

  return (
    <IconButton
      className="menu-btn"
      icon="md_rotate_counter_clockwise"
      iconSize={24}
      tooltipData={{ location: 'bottom', title: t('common.rotateCounterClockwise') }}
      onClick={_onClick}
    />
  );
};

RotateCounterClockwise.propTypes = {
  index: PropTypes.number.isRequired,
};

export default RotateCounterClockwise;
