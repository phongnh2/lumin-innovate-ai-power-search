import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Select from 'lumin-components/GeneralLayout/general-components/Select';
import ColorPalette from 'luminComponents/GeneralLayout/general-components/ColorPalette';

import { useTranslation } from 'hooks';

import { array as arrayUtils } from 'utils';

import { ANNOTATION_STYLE } from 'constants/documentConstants';
import { CUSTOM_FONTS, MAX_FONT_SIZE, MIN_FONT_SIZE } from 'constants/formBuildTool';

import { useUpdateFontSize } from './useUpdateFontSize';
import * as Styled from '../../FormBuilder.styled';
import { useFormBuilderContext } from '../../formBuilderContext';
import { useFormFieldDimensionContext } from '../../FormFieldDimensionContext';
import { getFontSize, convertFontSize } from '../../utils';

const TextStyle = ({ onChange, style }) => {
  const { t } = useTranslation();
  const { formFieldAnnotation } = useFormBuilderContext();
  const { height: formFieldHeight } = useFormFieldDimensionContext();
  const [fontSize, setFontSize] = useState(() =>
    getFontSize({
      initialStyle: style,
      annotation: formFieldAnnotation,
      onStyleChange: onChange,
    })
  );

  const getFonts = () => {
    let fontsToBeReturned = [...CUSTOM_FONTS];
    const annotationFont = formFieldAnnotation.font.name;
    const isFound = CUSTOM_FONTS.some((item) => item.value === annotationFont);
    if (annotationFont && !isFound) {
      fontsToBeReturned = [{ value: annotationFont, name: annotationFont, disabled: true }, ...CUSTOM_FONTS];
    }

    return fontsToBeReturned.map(({ value, ...rest }) => ({
      value,
      ...rest,
      itemProps: { sx: { '& .MenuItemHeadline': { fontFamily: value } } },
    }));
  };

  const getMaxFontSize = () => {
    const height = Math.round(formFieldHeight);
    return Math.round(Math.max(Math.min(MAX_FONT_SIZE, height * 0.75), MIN_FONT_SIZE));
  };

  const getFontSizeOptions = () => {
    const maxFontSize = getMaxFontSize();

    const fontSizeOptions = arrayUtils.createRangeArray(MIN_FONT_SIZE, maxFontSize || MAX_FONT_SIZE) || [];

    return fontSizeOptions.map((value) => ({ value, label: `${value} pt` }));
  };

  const onFontChange = (_, { value }) => {
    onChange(ANNOTATION_STYLE.FONT, value, { withoutInitValueChange: false });
  };

  const onFontSizeChange = (value) => {
    const convertedValue = convertFontSize(value);
    setFontSize(convertedValue);
    onChange(ANNOTATION_STYLE.FONT_SIZE, convertedValue, { withoutInitValueChange: false });
  };

  const onSelectChange = (_, { value }) => {
    onFontSizeChange(value);
  };

  const onColorChange = (_, value) => {
    onChange(ANNOTATION_STYLE.TEXT_COLOR, value);
  };

  const fontSizeList = getFontSizeOptions();

  useUpdateFontSize({
    setFontSize,
    maxFontSize: getMaxFontSize(),
    fontSize,
  });

  return (
    <Styled.TextStyleWrapper>
      <Styled.TextStyleTitle>{t('viewer.formBuildPanel.textStyle')}</Styled.TextStyleTitle>
      <Styled.TextStyleRow>
        <Styled.FontSelectWrapper>
          <Select
            value={formFieldAnnotation.font.name}
            options={getFonts()}
            labelKey="name"
            onChange={onFontChange}
            inputProps={{ style: { fontFamily: formFieldAnnotation.font.name } }}
          />
        </Styled.FontSelectWrapper>

        <Styled.FontSizeSelectWrapper>
          <Select
            value={fontSize}
            options={fontSizeList}
            onChange={onSelectChange}
          />
        </Styled.FontSizeSelectWrapper>
      </Styled.TextStyleRow>

      <ColorPalette onChange={onColorChange} value={style.TextColor} />
    </Styled.TextStyleWrapper>
  );
};

TextStyle.propTypes = {
  style: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TextStyle;
