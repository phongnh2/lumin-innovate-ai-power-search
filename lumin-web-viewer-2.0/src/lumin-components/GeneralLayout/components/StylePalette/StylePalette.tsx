import React from 'react';

import FrameStylePalette from '@new-ui/general-components/FrameStylePalette';
import OpacitySlider from '@new-ui/general-components/OpacitySlider';
import TextStylePalette from '@new-ui/general-components/TextStylePalette';
import withBaseStylePaletteWrap from '@new-ui/HOCs/withBaseStylePaletteWrap';

import { useTranslation } from 'hooks';

import { IStylePaletteProps } from './StylePalette.interface';

const StylePalette = ({ onChange, style, annotation, showTextDecoration }: IStylePaletteProps): JSX.Element => {
  const { t } = useTranslation();

  if (annotation instanceof window.Core.Annotations.StampAnnotation) {
    return <OpacitySlider style={style} onChange={onChange} />;
  }

  return (
    <>
      <TextStylePalette
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        title={t('viewer.formBuildPanel.textStyle')}
        onChange={onChange}
        style={style}
        showTextDecoration={showTextDecoration}
        annotation={annotation}
      />

      <FrameStylePalette title={t('generalLayout.toolProperties.textFrame')} onChange={onChange} style={style} />

      <OpacitySlider style={style} onChange={onChange} withTitle />
    </>
  );
};

StylePalette.defaultProps = {
  annotation: {} as Core.Annotations.Annotation,
};

export default withBaseStylePaletteWrap(StylePalette, 313);
