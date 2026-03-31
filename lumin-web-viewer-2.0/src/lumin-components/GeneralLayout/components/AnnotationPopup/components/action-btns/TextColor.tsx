import React from 'react';
import { useTranslation } from 'react-i18next';

import ColorCell from '@new-ui/general-components/ColorPalette/components/ColorCell';
import Divider from '@new-ui/general-components/Divider';
import IconButton from '@new-ui/general-components/IconButton';

interface ITextColor {
  color: {
    R: number;
    G: number;
    B: number;
    A: number;
  };
  onClick: () => void;
}

const TextColor = (props: ITextColor) => {
  const { t } = useTranslation();
  const { color, onClick } = props;

  if (!color) {
    return null;
  }

  const extractedColor = `rgba(${color.R}, ${color.G}, ${color.B}, ${color.A})`;

  return (
    <>
      <IconButton tooltipData={{ location: 'bottom', title: t('option.annotationColor.TextColor') }} onClick={onClick}>
        <ColorCell color={extractedColor} onClick={onClick} />
      </IconButton>
      <Divider orientation="vertical" style={{ height: 32, margin: 0 }} />
    </>
  );
};

export default TextColor;
