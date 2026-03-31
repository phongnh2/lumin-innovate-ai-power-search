import React, { useContext } from 'react';
import styled from 'styled-components';

import ColorPaletteLumin from 'lumin-components/ColorPaletteLumin';

import { useTranslation } from 'hooks';

import annotationColorMapKey from 'constants/annotationColorMapKey';
import { ANNOTATION_STYLE } from 'constants/documentConstants';

import { RubberStampModalContentContext } from '../RubberStampModalContent';

import * as Styled from './BackgroundColorFormItem.styled';

const ColorPallete = styled(ColorPaletteLumin)`
  &[data-new-layout='true'] {
    margin-bottom: 16px;
  }
`;

const BackgroundColorFormItem = () => {
  const { formData } = useContext(RubberStampModalContentContext);
  const { color, setColor } = formData;
  const { t } = useTranslation();

  const onBgColorChange = (_, value) => {
    setColor(value);
  };

  return (
    <div data-cy="background_color_form_item">
      <Styled.Label data-new-layout>
        {t('common.backgroundColor')}
      </Styled.Label>
      <ColorPallete
        isNewLayout
        data-new-layout
        className="rubber-stamp-text-style--text-color-palette"
        onStyleChange={onBgColorChange}
        color={color}
        colorMapKey={annotationColorMapKey.RUBBER_STAMP.BG}
        property={ANNOTATION_STYLE.TEXT_COLOR}
      />
    </div>
  );
};

export default BackgroundColorFormItem;
