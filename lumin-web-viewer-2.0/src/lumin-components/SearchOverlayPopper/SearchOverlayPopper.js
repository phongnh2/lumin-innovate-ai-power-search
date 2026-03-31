import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

import MaterialPopper from 'lumin-components/MaterialPopper';

import { useWindowSize } from 'hooks';

import { isSmallDesktop } from 'helpers/device';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import DataElements from 'constants/dataElement';

const SearchOverLay = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/SearchOverlay'));

const propTypes = {
  isOpen: PropTypes.bool,
  isSearchOverlayOpen: PropTypes.bool,
  closeElements: PropTypes.func.isRequired,
  openElement: PropTypes.func.isRequired,
};

const defaultProps = {
  isOpen: false,
  isSearchOverlayOpen: false,
};

const RESIZE_DEBOUNCE_TIME = 500;
const SearchOverlayPopper = ({
  isOpen, isSearchOverlayOpen, closeElements, openElement,
}) => {
  const [anchorEl, setAnchorEl] = useState();
  const { width } = useWindowSize();
  const debouncedOnResize = useRef(debounce(onResize, RESIZE_DEBOUNCE_TIME)).current;

  const getAnchorEl = () => {
    const dataElement = !isSmallDesktop() ? `${DataElements.SEARCH_TOOL_BUTTON}-tablet` : DataElements.SEARCH_TOOL_BUTTON;
    const element = document.querySelector(`[data-element=${dataElement}]`);
    setAnchorEl(element);
  };

  useEffect(() => {
    window.addEventListener('resize', debouncedOnResize);
    return () => {
      window.removeEventListener('resize', debouncedOnResize);
    };
  }, []);

  useEffect(() => {
    getAnchorEl();
  }, [isOpen, width]);

  useEffect(() => {
    if (isSearchOverlayOpen) {
      openElement('searchOverlayPopper');
    } else {
      closeElements(['searchPanel', 'searchOverlayPopper']);
    }
  }, [isSearchOverlayOpen]);

  function onResize() {
    closeElements(['searchOverlay', 'searchOverlayPopper']);
  }

  const handleClose = (e) => {
    if (anchorEl.contains(e.target)) {
      return;
    }
    closeElements(['searchOverlay', 'searchPanel', 'searchOverlayPopper']);
  };

  if (!anchorEl) {
    return null;
  }

  return (
    <MaterialPopper
      open={isOpen}
      anchorEl={anchorEl}
      placement="bottom-start"
      classes="SearchOverlayPopper"
      handleClose={handleClose}
    >
      {isOpen ? <SearchOverLay /> : <div />}
    </MaterialPopper>
  );
};

SearchOverlayPopper.propTypes = propTypes;
SearchOverlayPopper.defaultProps = defaultProps;
export default SearchOverlayPopper;
