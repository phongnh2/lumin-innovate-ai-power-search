import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import MaterialPopper from 'luminComponents/MaterialPopper';

import { isSmallDesktop } from 'helpers/device';

import DataElements from 'constants/dataElement';

import { POPPER_SCROLL_CN } from './constants';
import RubberStampOverlayContent from './RubberStampOverlayContent';

const DEBOUNCE_TIME = 500;

const RubberStampOverlay = ({ isOpen, closeElements }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const updateAnchorElement = useCallback(() => {
    const dataElement = !isSmallDesktop()
      ? `${DataElements.RUBBER_STAMP_BUTTON}-tablet`
      : DataElements.RUBBER_STAMP_BUTTON;
    const element = document.querySelector(`[data-element=${dataElement}]`);
    if (element) {
      setAnchorEl(element);
    }
  }, []);

  const handleWindowResize = useCallback(() => {
    updateAnchorElement();
  }, [updateAnchorElement]);

  useEffect(() => updateAnchorElement(), [updateAnchorElement]);

  useEffect(() => {
    const debouncedHandleWindowResize = debounce(handleWindowResize, DEBOUNCE_TIME);

    window.addEventListener('resize', debouncedHandleWindowResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleWindowResize);
    };
  }, [handleWindowResize]);

  const closeRubberStampOverlay = () => closeElements(DataElements.RUBBER_STAMP_OVERLAY);
  return (
    <MaterialPopper
      open={isOpen}
      anchorEl={anchorEl}
      handleClose={closeRubberStampOverlay}
      scrollbarClassName={POPPER_SCROLL_CN}
    >
      <RubberStampOverlayContent closePopper={closeRubberStampOverlay} />
    </MaterialPopper>
  );
};

RubberStampOverlay.propTypes = {
  isOpen: PropTypes.bool,
  closeElements: PropTypes.func,
};
RubberStampOverlay.defaultProps = {
  isOpen: false,
  closeElements: (f) => f,
};

export default RubberStampOverlay;
