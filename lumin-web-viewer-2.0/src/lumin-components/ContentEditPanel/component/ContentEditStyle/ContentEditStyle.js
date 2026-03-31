/* eslint-disable jsx-a11y/no-static-element-interactions */
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ThemeProvider } from 'styled-components';

import FontSizeDropdown from 'lumin-components/FontSizeDropDown';
import Icomoon from 'lumin-components/Icomoon';
import { InputSize } from 'lumin-components/Shared/Input/types/InputSize';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { useThemeMode, useTranslation } from 'hooks';

import {
  NEW_UI_CONTENT_EDIT_FONTS,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  DEBOUNCE_TIME,
  regexInputNumber,
  DEFAULT_FONT_SIZE_VALUE,
  regexInputFont,
} from 'constants/contentEditTool';
import { ANNOTATION_STYLE } from 'constants/documentConstants';

import { StyledTabLabelContent, theme } from '../../ContentEditPanel.styled';

import './ContentEditStyle.scss';
import * as Styled from './ContentEditStyle.styled';

function ContentEditStyle(props) {
  const {
    disabled,
    freeTextMode,
    textEditProperties,
    onFontStyleChange,
    onTextFormatChange,
    format,
    contentSelectMode,
  } = props;
  const { t } = useTranslation();
  const themeMode = useThemeMode();

  const [fontSizeValue, setFontSizeValue] = useState(DEFAULT_FONT_SIZE_VALUE);
  const inputFontSizeRef = useRef();
  const [openFontSizePopper, setOpenFontSizePopper] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [font, setFont] = useState('');

  useEffect(() => {
    if (textEditProperties.Font) {
      const fontValue = textEditProperties.Font.replace(regexInputFont, '');
      setFont(fontValue);
    }
  }, [textEditProperties.Font]);

  useEffect(() => {
    if (textEditProperties.FontSize) {
      setFontSizeValue(parseInt(textEditProperties.FontSize.split('pt')[0]));
    }
  }, [textEditProperties.FontSize]);

  useEffect(() => {
    setOpenFontSizePopper(false);
    setInputFocused(false);
  }, [disabled]);

  const renderCheckedActiveFont = () => (
    <span className="palette__font-selected">
      <Icomoon className="check" size={14} />
    </span>
  );

  const convertValue = (inputValue) => `${Math.round(inputValue)}pt`;

  const handleFontSizeChange = (value) => {
    setFontSizeValue(value);
    onFontStyleChange(ANNOTATION_STYLE.FONT_SIZE, convertValue(value));
  };

  const handleFontFamilyChange = (item) => {
    onFontStyleChange(ANNOTATION_STYLE.FONT, item.value);
  };

  const onChange = (value) => {
    if (Number(value) >= MIN_FONT_SIZE && Number(value) <= MAX_FONT_SIZE) {
      handleFontSizeChange(value);
    }
  };

  const debounceInput = useCallback(debounce(onChange, DEBOUNCE_TIME), []);

  const handleChangeInput = (event) => {
    const { value } = event.target;
    const validationInput = new RegExp(regexInputNumber);
    if (value && !validationInput.test(value)) {
      return;
    }

    setFontSizeValue(value);
    debounceInput(value);
  };

  const handleOnBlur = (e) => {
    const value = Number(e.target.value);
    const fallbackValue = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, value));
    handleFontSizeChange(fallbackValue);
    setInputFocused(false);
  };

  const onInputFocus = () => {
    setOpenFontSizePopper(true);
    setInputFocused(true);
  };

  const handleClickFontSizeInput= () => {
    if (contentSelectMode) {
      setOpenFontSizePopper(true);
      return;
    }

    if (!inputFocused) {
      inputFontSizeRef.current.focus();
    }
  };

  const fontProperties = [
    {
      title: 'option.richText.bold',
      icon: 'tool-bold',
      iconSize: 17,
      key: 'bold',
    },
    {
      title: 'option.richText.italic',
      icon: 'tool-italic',
      iconSize: 17,
      key: 'italic',
    },
    {
      title: 'option.richText.underline',
      icon: 'tool-underline',
      iconSize: 17,
      key: 'underline',
    },
  ];

  return (
    <ThemeProvider theme={theme[themeMode]}>
      <div>
        <StyledTabLabelContent>{t('viewer.contentEditPanel.textFormat')}</StyledTabLabelContent>
        <Tooltip title={disabled ? t('viewer.contentEditPanel.tooltipContent') : ''}>
          <Styled.StyledWrapper $disabled={disabled}>
            <Styled.StyledTextWrapper $disabled={freeTextMode}>
              <Styled.StyledMaterialSelect
                value={!disabled && font}
                onSelected={handleFontFamilyChange}
                containerClasses="ContentEditStyle__MaterialSelect"
                inputClasses="input ContentEditStyle__MaterialSelect-input"
                items={NEW_UI_CONTENT_EDIT_FONTS}
                arrowIcon="arrow-down-alt"
                arrowStyle={{ size: 8 }}
                childNameComponent={renderCheckedActiveFont()}
                scrollbarsMaxheight={200}
              />

              <div
                className="ContentEditStyle__inputFontSize"
                onClick={handleClickFontSizeInput}
              >
                <Styled.StyledInput
                  ref={inputFontSizeRef}
                  value={`${disabled ? DEFAULT_FONT_SIZE_VALUE : fontSizeValue}${!inputFocused ? ' pt' : ''}`}
                  postfix={
                    <span className="ContentEditStyle__Input ">
                      <Icomoon className="arrow-down-alt" size={8} />
                    </span>
                  }
                  onChange={handleChangeInput}
                  onBlur={handleOnBlur}
                  onFocus={onInputFocus}
                  size={InputSize.TINY}
                />
              </div>
              {openFontSizePopper && (
                <FontSizeDropdown
                  inputFontSizeRef={inputFontSizeRef}
                  inputFocused={inputFocused}
                  fontSizeValue={fontSizeValue}
                  setOpenFontSizePopper={setOpenFontSizePopper}
                  handleUpdateFontSize={handleFontSizeChange}
                  renderCheckedActiveFont={renderCheckedActiveFont}
                  prefixClass="ContentEditStyle"
                />
              )}
            </Styled.StyledTextWrapper>
            <div
              onMouseDown={(e) => {
                if (e.type !== 'touchstart') {
                  e.preventDefault();
                }
              }}
            >
              <Styled.StyledPaletteWrapper>
                {fontProperties.map((item, idx) => (
                  <Styled.StyledActionButton
                    key={idx}
                    {...item}
                    onClick={() => onTextFormatChange(item.key)}
                    isActive={!disabled && format[item.key]}
                  />
                ))}
              </Styled.StyledPaletteWrapper>
            </div>
          </Styled.StyledWrapper>
        </Tooltip>
      </div>
    </ThemeProvider>
  );
}

ContentEditStyle.propTypes = {
  disabled: PropTypes.bool,
  freeTextMode: PropTypes.bool,
  onFontStyleChange: PropTypes.func,
  onTextFormatChange: PropTypes.func,
  textEditProperties: PropTypes.object,
  format: PropTypes.object,
  contentSelectMode: PropTypes.bool.isRequired,
};

ContentEditStyle.defaultProps = {
  disabled: true,
  freeTextMode: false,
  onFontStyleChange: () => {},
  onTextFormatChange: () => {},
  textEditProperties: {},
  format: {},
};

export default ContentEditStyle;
