import PropTypes from 'prop-types';
import React from 'react';

import ColorPalette from 'luminComponents/GeneralLayout/general-components/ColorPalette';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import * as Styled from './FrameStylePalette.styled';

const FillStyle = ({ style, onChange, disablePortal = false }) => {
  const onColorPaletteChange = (_, value) => {
    onChange(ANNOTATION_STYLE.FILL_COLOR, value);
  };

  return (
    <Styled.ContentInnerWrapper>
      <Styled.ColorPaletteWrapper data-cy="frame_color_palette_wrapper">
        <ColorPalette
          includeNoFill
          className="color-palette"
          onChange={onColorPaletteChange}
          value={style.FillColor}
          disablePortal={disablePortal}
        />
      </Styled.ColorPaletteWrapper>
    </Styled.ContentInnerWrapper>
  );
};

FillStyle.propTypes = {
  disablePortal: PropTypes.bool,
  style: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FillStyle;
