import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import PropTypes from 'prop-types';
import React from 'react';

import MaterialPopper from 'luminComponents/MaterialPopper';

import { array as arrayUtils } from 'utils';

import { MIN_FONT_SIZE, MAX_FONT_SIZE } from 'constants/contentEditTool';

function FontSizeDropdown(props) {
  const {
    inputFontSizeRef,
    inputFocused,
    fontSizeValue,
    setOpenFontSizePopper,
    handleUpdateFontSize,
    renderCheckedActiveFont,
    prefixClass,
    maxFontSize,
  } = props;
  const values = arrayUtils.createRangeArray(MIN_FONT_SIZE, maxFontSize) || [];

  const handleClosePopper = () => {
    if (!inputFocused) {
      setOpenFontSizePopper(false);
    }
  };

  const handleOnClick = (value) => {
    handleUpdateFontSize(value);
    setOpenFontSizePopper(false);
  };

  return (
    <MaterialPopper
      open
      anchorEl={inputFontSizeRef.current}
      classes={`${prefixClass}__MaterialPopper`}
      handleClose={handleClosePopper}
      autoHeightMax={250}
    >
      <MenuList className={`${prefixClass}__MenuList`} disablePadding>
        {values.map((value, idx) => (
          <MenuItem key={idx} onClick={() => handleOnClick(value)}>
            {value} pt {value === Number(fontSizeValue) && renderCheckedActiveFont()}
          </MenuItem>
        ))}
      </MenuList>
    </MaterialPopper>
  );
}

FontSizeDropdown.propTypes = {
  inputFontSizeRef: PropTypes.object,
  inputFocused: PropTypes.bool,
  fontSizeValue: PropTypes.number,
  setOpenFontSizePopper: PropTypes.func,
  handleUpdateFontSize: PropTypes.func,
  renderCheckedActiveFont: PropTypes.func,
  prefixClass: PropTypes.string,
  maxFontSize: PropTypes.number,
};

FontSizeDropdown.defaultProps = {
  inputFontSizeRef: {},
  inputFocused: false,
  fontSizeValue: 12,
  setOpenFontSizePopper: () => {},
  handleUpdateFontSize: () => {},
  renderCheckedActiveFont: () => {},
  prefixClass: 'FreeTextPaletteHeader',
  maxFontSize: MAX_FONT_SIZE,
};

export default FontSizeDropdown;
