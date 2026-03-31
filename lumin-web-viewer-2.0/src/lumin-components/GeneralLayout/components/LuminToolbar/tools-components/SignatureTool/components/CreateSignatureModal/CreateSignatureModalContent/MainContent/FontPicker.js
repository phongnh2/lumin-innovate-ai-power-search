/* eslint-disable arrow-body-style */
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';

import Menu, { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';
import Popper from 'lumin-components/GeneralLayout/general-components/Popper';
import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';

import { useTranslation } from 'hooks';

import { CUSTOM_SIGNATURE_FONTS } from './constants';
import { CreateSignatureModalContentContext } from './CreateSignatureModalContentContext';

import * as Styled from './MainContent.styled';

export const FontPicker = ({ setOpenChangeFont }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const { signatureFont, changeFont } = useContext(CreateSignatureModalContentContext);
  const { t } = useTranslation();

  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
    setOpenChangeFont(false);
  };

  const getNameFontByValue = (value) => {
    const result = CUSTOM_SIGNATURE_FONTS.find((font) => font.value === value);
    return result.name;
  };

  const handleClick = (event) => {
    if (open) {
      handleClose();
      return;
    }

    setAnchorEl(event.currentTarget);
    setOpenChangeFont(true);
  };

  return (
    <>
      <Styled.ColorPickerWrapper>
        <Styled.ChangeColor>{t('viewer.signatureModal.changeFont')}</Styled.ChangeColor>

        <SingleButton
          isActive={open}
          showArrow
          style={{ fontFamily: `"${signatureFont}", cursive` }}
          onClick={handleClick}
          ref={anchorEl}
          label={getNameFontByValue(signatureFont)}
        />
      </Styled.ColorPickerWrapper>

      <Popper open={open} anchorEl={anchorEl} onClose={handleClose} style={{ zIndex: 111111 }}>
        <Menu>
          {CUSTOM_SIGNATURE_FONTS.map((font) => (
            <MenuItem
              sx={{ '& .MenuItemHeadline': { fontFamily: `"${font.value}", cursive` } }}
              key={font.value}
              className="ChangeFont__popper-item"
              onClick={() => {
                handleClose();
                changeFont(font.value);
              }}
              displayCheckIcon
              activated={font.value === signatureFont}
              hideIcon={font.value !== signatureFont}
            >
              {font.name}
            </MenuItem>
          ))}
        </Menu>
      </Popper>
    </>
  );
};

FontPicker.propTypes = {
  setOpenChangeFont: PropTypes.func.isRequired,
};

export default FontPicker;
