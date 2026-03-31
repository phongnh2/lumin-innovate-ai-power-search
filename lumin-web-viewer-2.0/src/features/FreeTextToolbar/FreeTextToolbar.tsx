import React from 'react';

import SecondaryToolbar from '@new-ui/components/SecondaryToolbar';
import withBaseStylePaletteWrap from '@new-ui/HOCs/withBaseStylePaletteWrap';

import { IAnnotationStyle } from 'interfaces/viewer/viewer.interface';

import DecorationSelector from './components/DecorationSelector';
import FontFamilySelector from './components/FontFamilySelector';
import FontSizeSelector from './components/FontSizeSelector';
import OpacitySelector from './components/OpacitySelector';
import TextColorSelector from './components/TextColorSelector';
import TextFrameSelector from './components/TextFrameSelector';

interface FreeTextToolbarProps {
  style: IAnnotationStyle;
  annotation: Core.Annotations.Annotation | null;
  onChange?: () => void;
}

const FreeTextToolbar = ({ style, annotation, onChange }: FreeTextToolbarProps) => (
  <SecondaryToolbar.LeftSection>
    <FontFamilySelector style={style} onChange={onChange} />

    <SecondaryToolbar.Divider />

    <FontSizeSelector style={style} onChange={onChange} />

    <SecondaryToolbar.Divider />

    <DecorationSelector annotation={annotation} onChange={onChange} />

    <SecondaryToolbar.Divider />

    <TextColorSelector style={style} onChange={onChange} />
    <TextFrameSelector style={style} onChange={onChange} />

    <SecondaryToolbar.Divider />

    <OpacitySelector style={style} onChange={onChange} />
  </SecondaryToolbar.LeftSection>
);

export default withBaseStylePaletteWrap(FreeTextToolbar, null, 0);
