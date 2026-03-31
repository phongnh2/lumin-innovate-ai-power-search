/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { Dropdown } from '@new-ui/general-components/Dropdown';

import Divider from 'lumin-components/GeneralLayout/general-components/Divider';
import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import Tooltip from 'lumin-components/GeneralLayout/general-components/Tooltip';

import { useTranslation } from 'hooks';

import { array as arrayUtils } from 'utils';

import {
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  DEFAULT_FONT_SIZE_VALUE,
  NEW_UI_CONTENT_EDIT_FONTS,
} from 'constants/contentEditTool';
import { ANNOTATION_STYLE } from 'constants/documentConstants';

import * as Styled from '../../EditPdfPanel.styled';

function EditPdfStyle(props) {
  const { disabled, freeTextMode, textEditProperties, onFontStyleChange, onTextFormatChange, format } = props;
  const { t } = useTranslation();

  const [fontSizeValue, setFontSizeValue] = useState(DEFAULT_FONT_SIZE_VALUE);
  const [font, setFont] = useState('Font');

  const values =
    [
      {
        label: '--',
        value: '',
      },
      ...arrayUtils.createFontsizeArray(MIN_FONT_SIZE, MAX_FONT_SIZE),
    ] || [];

  useEffect(() => {
    if (textEditProperties.Font) {
      const foundFontValue = NEW_UI_CONTENT_EDIT_FONTS.find((item) => item.label === textEditProperties.Font);
      if (foundFontValue) {
        setFont(foundFontValue.value);
      }
    }
  }, [textEditProperties.Font]);

  useEffect(() => {
    if (textEditProperties.FontSize) {
      const foundFontSizeValue = values.find((item) => item.label === textEditProperties.FontSize);
      if (foundFontSizeValue) {
        setFontSizeValue(foundFontSizeValue.value);
      } else {
        setFontSizeValue(undefined);
      }
    }
  }, [textEditProperties.FontSize]);

  const handleFontSizeChange = ({ label, value }) => {
    setFontSizeValue(value);
    onFontStyleChange(ANNOTATION_STYLE.FONT_SIZE, label);
  };

  const handleFontFamilyChange = ({ value }) => {
    setFont(value);
    onFontStyleChange(ANNOTATION_STYLE.FONT, value);
  };

  const fontProperties = [
    {
      icon: 'sm_bold',
      key: 'bold',
    },
    {
      icon: 'sm_italic',
      key: 'italic',
    },
    {
      icon: 'md_underline',
      key: 'underline',
    },
  ];

  return (
    <Styled.EditPdfStyleWrapper>
      <Styled.SubTitle>{t('viewer.contentEditPanel.textFormat')}</Styled.SubTitle>
      <Tooltip title={disabled ? t('viewer.contentEditPanel.tooltipContent') : ''}>
        <Styled.ContentWrapper>
          <Dropdown
            selectedValue={font}
            onSelect={handleFontFamilyChange}
            options={NEW_UI_CONTENT_EDIT_FONTS}
            disabled={freeTextMode || disabled}
          />
          <Styled.FontStyleWrapper>
            <Dropdown
              selectedValue={fontSizeValue}
              onSelect={handleFontSizeChange}
              options={values}
              disabled={freeTextMode || disabled}
            />
            <Divider orientation="vertical" style={{ height: 16 }} />
            {fontProperties.map((item) => (
              <IconButton
                key={item.key}
                icon={item.icon}
                onClick={() => onTextFormatChange(item.key)}
                iconSize={24}
                active={!disabled && format[item.key]}
                disabled={disabled}
                tooltipData={{ title: t(`option.richText.${item.key}`), location: 'bottom' }}
              />
            ))}
          </Styled.FontStyleWrapper>
        </Styled.ContentWrapper>
      </Tooltip>
    </Styled.EditPdfStyleWrapper>
  );
}

EditPdfStyle.propTypes = {
  disabled: PropTypes.bool,
  freeTextMode: PropTypes.bool,
  onFontStyleChange: PropTypes.func,
  onTextFormatChange: PropTypes.func,
  textEditProperties: PropTypes.object,
  format: PropTypes.object,
};

EditPdfStyle.defaultProps = {
  disabled: true,
  freeTextMode: false,
  onFontStyleChange: () => {},
  onTextFormatChange: () => {},
  textEditProperties: {},
  format: {},
};

export default EditPdfStyle;
