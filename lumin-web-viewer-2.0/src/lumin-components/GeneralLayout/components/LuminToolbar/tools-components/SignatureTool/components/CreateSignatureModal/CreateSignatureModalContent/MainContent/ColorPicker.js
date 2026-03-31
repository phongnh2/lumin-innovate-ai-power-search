/* eslint-disable arrow-body-style */
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { connect } from 'react-redux';

import StrokeWidthSlider from '@new-ui/components/StrokeWidthSlider';
import ColorPalette from '@new-ui/general-components/ColorPalette';
import Popper from '@new-ui/general-components/Popper';
import { ClickAwayMouseEvent } from '@new-ui/general-components/Popper/Popper.enum';
import withBaseStylePaletteWrap from '@new-ui/HOCs/withBaseStylePaletteWrap';

import { useTranslation } from 'hooks';

import { ANNOTATION_STYLE } from 'constants/documentConstants';
import { ModalPriority } from 'constants/styles/Modal';

import { CreateSignatureModalContentContext } from './CreateSignatureModalContentContext';
import { SIGNATURE_TYPE } from './MainContent';

import * as Styled from './MainContent.styled';

export const ColorPicker = ({ onChange, style, setOpenStyle }) => {
  const activeColor = style?.StrokeColor || new window.Core.Annotations.Color(0, 0, 0, 1);
  const [anchorEl, setAnchorEl] = useState(null);
  const { selectedSignatureType } = useContext(CreateSignatureModalContentContext);
  const { t } = useTranslation();

  const open = Boolean(anchorEl);

  const onColorPaletteChange = (_, value) => {
    onChange(ANNOTATION_STYLE.STROKE_COLOR, value);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenStyle(false);
  };

  const handleMouseDown = (event) => {
    if (open) {
      handleClose();
      return;
    }

    setAnchorEl(event.currentTarget);
    setOpenStyle(true);
  };

  return (
    <>
      <Styled.ColorPickerWrapper>
        <Styled.ChangeColor>{t('viewer.signatureModal.changeColor')}</Styled.ChangeColor>

        <Styled.ButtonChangeColor
          showArrow
          onMouseDown={handleMouseDown}
          iconColor={activeColor}
          icon="md_circle_filled"
          iconSize={24}
          isActive={open}
        />
      </Styled.ColorPickerWrapper>

      <Popper
        open={open}
        anchorEl={anchorEl}
        style={{ zIndex: ModalPriority.MEDIUM }}
        mouseEvent={ClickAwayMouseEvent.ON_MOUSE_DOWN}
        onClose={handleClose}
      >
        <Styled.ContentWrapper>
          {selectedSignatureType === SIGNATURE_TYPE.DRAW && (
            <StrokeWidthSlider onChange={onChange} style={style} min={1} />
          )}

          <ColorPalette className="color-palette" value={activeColor} onChange={onColorPaletteChange} />
        </Styled.ContentWrapper>
      </Popper>
    </>
  );
};

ColorPicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  style: PropTypes.object.isRequired,
  setOpenStyle: PropTypes.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default withBaseStylePaletteWrap(connect(mapStateToProps, mapDispatchToProps)(ColorPicker), null, 0);
