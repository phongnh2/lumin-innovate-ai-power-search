import PropTypes from 'prop-types';
import React from 'react';

import StrokeWidthSlider from 'luminComponents/GeneralLayout/components/StrokeWidthSlider';
import ColorPalette from 'luminComponents/GeneralLayout/general-components/ColorPalette';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import * as Styled from './FrameStylePalette.styled';

const StrokeStyle = ({ style, onChange, disablePortal = false }) => {
  const onColorPaletteChange = (_, value) => {
    onChange(ANNOTATION_STYLE.STROKE_COLOR, value);
  };

  return (
    <Styled.ContentInnerWrapper>
      <Styled.ColorPaletteWrapper data-cy="frame_color_palette_wrapper">
        <ColorPalette
          className="color-palette"
          value={style.StrokeColor}
          onChange={onColorPaletteChange}
          disablePortal={disablePortal}
        />
      </Styled.ColorPaletteWrapper>

      <StrokeWidthSlider onChange={onChange} style={style} />
    </Styled.ContentInnerWrapper>
  );
};

StrokeStyle.propTypes = {
  disablePortal: PropTypes.bool,
  style: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default StrokeStyle;
