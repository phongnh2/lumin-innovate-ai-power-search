import React from 'react';

import ColorPalette from 'luminComponents/GeneralLayout/general-components/ColorPalette';
import OpacitySlider from 'luminComponents/GeneralLayout/general-components/OpacitySlider';
import withBaseStylePaletteWrap from 'luminComponents/GeneralLayout/HOCs/withBaseStylePaletteWrap';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import { IStrokeStylePaletteProps } from './StrokeStylePalette.interface';
import StrokeWidthSlider from '../StrokeWidthSlider/StrokeWidthSlider';

import { Wrapper } from './StrokeStylePalette.styled';

const StrokeStylePalette = ({ style, onChange }: IStrokeStylePaletteProps): JSX.Element => {
  const onColorPaletteChange = (_: string, value: object): void => {
    onChange(ANNOTATION_STYLE.STROKE_COLOR, value);
  };

  return (
    <Wrapper>
      <StrokeWidthSlider onChange={onChange} style={style} />

      <ColorPalette
        className="color-palette"
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        value={style.StrokeColor}
        onChange={onColorPaletteChange}
      />

      <OpacitySlider style={style} onChange={onChange} />
    </Wrapper>
  );
};

export default withBaseStylePaletteWrap(StrokeStylePalette, 304);
