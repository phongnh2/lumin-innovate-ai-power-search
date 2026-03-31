import React from 'react';

import TextDecorationBtn from '@new-ui/general-components/TextStylePalette/TextDecorationBtn';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import { BaseFreeTextToolbarSelectorProps } from '../types';

const DecorationSelector = ({ onChange, annotation }: BaseFreeTextToolbarSelectorProps) => {
  const onDecorationChange = (value: object) => {
    onChange(ANNOTATION_STYLE.FONT_STYLE, value);
  };
  return <TextDecorationBtn onChange={onDecorationChange} annotation={annotation} />;
};

export default DecorationSelector;
