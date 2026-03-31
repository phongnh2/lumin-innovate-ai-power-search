import React from 'react';

import withBaseStylePaletteWrap from '@new-ui/HOCs/withBaseStylePaletteWrap';

import { ANNOTATION_STYLE } from 'constants/documentConstants';
import { spacings } from 'constants/styles/editor';

import { IAnnotationStyle } from 'interfaces/viewer/viewer.interface';

import * as Styled from './RedactStylePalette.styled';

type TRedactStylePaletteProps = {
  style: IAnnotationStyle;
  onChange: (property: string, value: number | string | object) => void;
};

const RedactStylePalette = ({ style, onChange }: TRedactStylePaletteProps) => {
  const property = ANNOTATION_STYLE.FILL_COLOR as keyof IAnnotationStyle;

  const onColorPaletteChange = (_: string, value: number | string | object) => {
    onChange(property, value);
  };

  return <Styled.CustomColorPalette onChange={onColorPaletteChange} value={style[property]} />;
};

export default withBaseStylePaletteWrap(RedactStylePalette, 270, spacings.le_gap_1);
