import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React from 'react';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import { CLICK_ACTION_EVENT_MAPPING, ROTATE_DIRECTION } from '../../constants';
import usePagetoolActionFromThumbnail from '../../hooks/usePagetoolActionFromThumbnail';

export const RotateClockwise = ({ index }) => {
  const { rotate, handleSendClickEvent } = usePagetoolActionFromThumbnail();
  const { t } = useTranslation();

  const onClick = () => {
    rotate({
      page: index + 1,
      angle: ROTATE_DIRECTION.RIGHT,
    });
    handleSendClickEvent(CLICK_ACTION_EVENT_MAPPING.rotateClockwiseFromOverlayBtn);
  };

  const _onClick = debounce(onClick, 300);

  return (
    <IconButton
      className="menu-btn"
      icon="md_rotate_clockwise"
      iconSize={24}
      tooltipData={{ location: 'bottom', title: t('common.rotateClockwise') }}
      onClick={_onClick}
    />
  );
};

RotateClockwise.propTypes = {
  index: PropTypes.number.isRequired,
};

export default RotateClockwise;
