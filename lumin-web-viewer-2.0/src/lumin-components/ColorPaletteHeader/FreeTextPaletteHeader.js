/* eslint-disable jsx-a11y/no-static-element-interactions */
import classNames from 'classnames';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useRef, useState, useCallback } from 'react';

import core from 'core';

import FontSizeDropdown from 'lumin-components/FontSizeDropDown';
import { InputSize } from 'lumin-components/Shared/Input/types/InputSize';
import ActionButton from 'luminComponents/ActionButton';
import Icomoon from 'luminComponents/Icomoon';
import MaterialSelect from 'luminComponents/MaterialSelect';
import Input from 'luminComponents/Shared/Input';

import { useTranslation } from 'hooks';

import getRichTextCSSStyle from 'helpers/getRichTextCSSStyle';
import resizeFreetextToFitContent from 'helpers/resizeFreetextToFitContent';

import annotationColorMapKey from 'constants/annotationColorMapKey';
import { ANNOTATION_STYLE, AnnotationSubjectMapping } from 'constants/documentConstants';
import { PREMIUM_FEATURE_NAME, TOOLS_NAME } from 'constants/toolsName';

import './ColorPaletteHeader.scss';

const MIN_FONT_SIZE = 5;
const MAX_FONT_SIZE = 45;
const DEBOUNCE_TIME = 700;

const regexInputNumber = /^\d+$/;

const TEXT_DECORATION = 'text-decoration';

const updateRichTextStyle = (annotation, richStyle) => {
  const richTextStyle = getRichTextCSSStyle(annotation.getContents(), richStyle);
  richTextStyle && annotation.setRichTextStyle(richTextStyle);
  core.getAnnotationManager().redrawAnnotation(annotation);
};

const CUSTOM_FONTS = [
  { value: 'Aladin', name: 'Aladin', class: 'font-aladin' },
  { value: 'Allura', name: 'Allura', class: 'font-allura' },
  { value: 'Cookie', name: 'Cookie', class: 'font-cookie' },
  { value: 'Courgette', name: 'Courgette', class: 'font-courgette' },
  { value: 'DancingScript', name: 'Dancing Script', class: 'font-dancing-script' },
  { value: 'GillSans', name: 'GillSans', class: 'font-gillSans' },
  { value: 'Helvetica', name: 'Helvetica', class: 'font-helvetica' },
  { value: 'Italianno', name: 'Italianno', class: 'font-italianno' },
  { value: 'Lora', name: 'Lora', class: 'font-lora' },
  { value: 'Merriweather', name: 'Merriweather', class: 'font-merriweather' },
  { value: 'Roboto', name: 'Roboto', class: 'font-roboto' },
];

const getPropertyName = (key) => ({
  bold: 'font-weight',
  italic: 'font-style',
  word: TEXT_DECORATION,
  'line-through': TEXT_DECORATION,
}[key]);

function checkExistedFontStyle(styleList, key) {
  let isActive = false;
  let styleStatus = '';

  const existedStyle = styleList.some((textStyle) => String(textStyle || '').includes(key));

  if (existedStyle) {
    styleStatus = 'active';
    isActive = true;
  }

  return {
    isActive, styleStatus,
  };
}

const addFontStyle = ({ key, objRichStyleKeys, richStyle, annotation, propertyName, onStyleChange = () => {} }) => {
  const newFontStyle = objRichStyleKeys?.length > 0 && objRichStyleKeys[0] ? [...objRichStyleKeys, key] : [key];

  onStyleChange(ANNOTATION_STYLE.FONT_STYLE, newFontStyle);
  if (annotation instanceof window.Core.Annotations.FreeTextAnnotation && propertyName) {
    if (propertyName === TEXT_DECORATION) {
      richStyle[propertyName] = `${richStyle[propertyName] || ''} ${key}`.trim();
    } else {
      richStyle[propertyName] = key;
    }
    updateRichTextStyle(annotation, richStyle);
  }

  resizeFreetextToFitContent(annotation);
};

const deleteFontStyle = ({ key, objRichStyleKeys, richStyle, annotation, propertyName, onStyleChange = () => {} }) => {
  const newFontStyle = objRichStyleKeys?.map((_fontValue) => {
    const fontValue = String(_fontValue || '');
    if (fontValue.includes(key)) {
      const replaceValue = fontValue.replaceAll(key, '').trim();
      if (replaceValue) return replaceValue;
    }
    return fontValue;
  });

  onStyleChange(ANNOTATION_STYLE.FONT_STYLE, newFontStyle);
  const finalProperties = richStyle[propertyName]?.replaceAll(key, '').trim();
  if (annotation instanceof window.Core.Annotations.FreeTextAnnotation) {
    if (propertyName !== TEXT_DECORATION || !finalProperties) {
      delete richStyle[propertyName];
    } else if (finalProperties) {
      richStyle[propertyName] = finalProperties;
    }
    updateRichTextStyle(annotation, richStyle);
  }
};

const onChangeFontStyle = ({ key, annotation, onStyleChange = () => {} }) => {
  const annotationContentLength = annotation.getContents()?.length;
  const defaultStyle = annotation.getRichTextStyle();

  if (!Object.prototype.hasOwnProperty.call(defaultStyle, annotationContentLength)) {
    defaultStyle[annotationContentLength] = {};
  }

  const richStyle = defaultStyle[Object.keys(defaultStyle)[0]];

  const objRichStyleKeys = Object.values(richStyle);

  const propertyName = getPropertyName(key);

  const fontStyleParam = {
    key, objRichStyleKeys, richStyle, annotation, propertyName, onStyleChange,
  };

  objRichStyleKeys === undefined || !checkExistedFontStyle(objRichStyleKeys, key).isActive
    ? addFontStyle({ ...fontStyleParam })
    : deleteFontStyle({ ...fontStyleParam });
};
function FreeTextPaletteHeader(props) {
  const {
    isAnnotationStylePopup, style: { Font, FontSize }, annotation, colorPalette, colorMapKey, onStyleChange,
  } = props;
  const { t } = useTranslation();
  const initialFontSizeValue = FontSize?.split('pt')[0];
  const inputFontSizeRef = useRef();
  const [fontSizeValue, setFontSizeValue] = useState(parseInt(initialFontSizeValue));
  const [inputFocused, setInputFocused] = useState(false);
  const [openFontSizePopper, setOpenFontSizePopper] = useState(false);

  const isNoContentFreeText =
    annotation && annotation.Subject === AnnotationSubjectMapping.freetext && !annotation.getContents();
  const buttonDisableClass = isNoContentFreeText ? 'FreeTextPaletteHeader__ActionButton--disabled' : '';

  const convertValue = (inputValue) => `${Math.round(inputValue)}pt`;

  const setFont = (item) => {
    onStyleChange(ANNOTATION_STYLE.FONT, item.value);
  };

  const handleUpdateFontSize = (value) => {
    setFontSizeValue(value);
    onStyleChange(ANNOTATION_STYLE.FONT_SIZE, convertValue(value));
  };

  const onChange = (value) => {
    if (Number(value) >= MIN_FONT_SIZE && Number(value) <= MAX_FONT_SIZE) {
      handleUpdateFontSize(value);
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
    handleUpdateFontSize(fallbackValue);
    setInputFocused(false);
  };

  const onInputFocus = () => {
    setOpenFontSizePopper(true);
    setInputFocused(true);
  };

  const renderTitleHeader = () => {
    let title = t('documentPage.style');
    if (
      [PREMIUM_FEATURE_NAME[TOOLS_NAME.FREETEXT], annotationColorMapKey.DATE_FREE_TEXT].includes(colorMapKey)
    ) {
      if (colorPalette === ANNOTATION_STYLE.TEXT_COLOR) {
        title = t('documentPage.textStyle');
      }
      if (colorPalette === ANNOTATION_STYLE.STROKE_COLOR || colorPalette === ANNOTATION_STYLE.FILL_COLOR) {
        title = t('documentPage.textFrame');
      }
    }
    return <p>{title}</p>;
  };

  const _onKeyPressEnter = (e) => {
    if (e.key === 'Enter') {
      inputFontSizeRef.current.blur();
      setOpenFontSizePopper(false);
    }
  };

  const renderActiveClass = (key) => {
    const defaultStyle = isAnnotationStylePopup && annotation && annotation.getRichTextStyle();

    if (defaultStyle) {
      const richStyle = defaultStyle[Object.keys(defaultStyle)[0]];
      const objRichStyleKeys = Object.values(richStyle);

      return checkExistedFontStyle(objRichStyleKeys, key).styleStatus;
    }
    return '';
  };

  const renderCheckedActiveFont = () => (
    <span className="palette__font-selected">
      <Icomoon className="check" size={14} />
    </span>
  );

  const fontProperties = [
    {
      title: 'option.richText.bold',
      icon: 'tool-bold',
      iconSize: 17,
      className: classNames('text-tool', renderActiveClass('bold'), buttonDisableClass),
      onClick: () => {
        onChangeFontStyle({ key: 'bold', annotation, onStyleChange });
      },
      disabled: isNoContentFreeText,
    },
    {
      title: 'option.richText.italic',
      icon: 'tool-italic',
      iconSize: 17,
      className: classNames('text-tool', renderActiveClass('italic'), buttonDisableClass),
      onClick: () => {
        onChangeFontStyle({ key: 'italic', annotation, onStyleChange });
      },
      disabled: isNoContentFreeText,
    },
    {
      title: 'option.richText.underline',
      icon: 'tool-underline',
      iconSize: 17,
      className: classNames('text-tool', renderActiveClass('word'), buttonDisableClass),
      onClick: () => {
        onChangeFontStyle({ key: 'word', annotation, onStyleChange });
      },
      disabled: isNoContentFreeText,
    },
    {
      title: 'option.richText.strikeout',
      icon: 'strikeout-freetext-tool',
      iconSize: 17,
      className: classNames('text-tool', renderActiveClass('line-through'), buttonDisableClass),
      onClick: () => {
        onChangeFontStyle({ key: 'line-through', annotation, onStyleChange });
      },
      disabled: isNoContentFreeText,
    },

  ];

  return (
    <div className="stylePopup-title">
      <div
        className={classNames({
          'palette--mg-0': colorPalette === ANNOTATION_STYLE.FILL_COLOR,
        })}
      >
        <span className="palette--title-free-text">
          {renderTitleHeader()}
        </span>
        <div
          className={classNames({
            palette: true,
            'ColorPaletteHeader__palette--flex': !isAnnotationStylePopup,
          })}
        >
          <MaterialSelect
            value={Font}
            onSelected={setFont}
            containerClasses={classNames({
              'FreeTextPaletteHeader__MaterialSelect--full-width': isAnnotationStylePopup,
              'FreeTextPaletteHeader__MaterialSelect--font-size': true,
              'FreeTextPaletteHeader__MaterialSelect__content--no-padding-left': true,
            })}
            inputClasses="input FreeTextPaletteHeader__MaterialSelect__input__content--justify-center"
            items={CUSTOM_FONTS}
            arrowIcon="arrow-down-alt"
            arrowStyle={{ size: 8 }}
            childNameComponent={renderCheckedActiveFont()}
          />
          <div
            className={classNames({
              'FreeTextPaletteHeader__input--wrapper': true,
              'FreeTextPaletteHeader__input--wrapper-flex': isAnnotationStylePopup,
            })}
          >
            <div
              role="blockquote"
              className="Input--container"
              onClick={() => {
                if (!inputFocused) {
                  inputFontSizeRef.current.focus();
                }
              }}
            >
              <Input
                ref={inputFontSizeRef}
                value={`${fontSizeValue}${!inputFocused ? ' pt' : ''}`}
                postfix={
                  <span className="FreeTextPaletteHeader__Input FreeTextPaletteHeader__Input--font-extension">
                    <Icomoon className="arrow-down-alt MaterialSelect__input__icon_dropdown" size={8} />
                  </span>
                }
                onChange={handleChangeInput}
                onBlur={handleOnBlur}
                onFocus={onInputFocus}
                onKeyPress={_onKeyPressEnter}
                size={InputSize.TINY}
              />
            </div>
            {isAnnotationStylePopup && (
            <div className="FreeTextPaletteHeader__ActionButton--wrapper">
              {fontProperties.map((item, idx) => (
                <ActionButton
                  key={idx}
                  title={item.title}
                  icon={item.icon}
                  iconSize={item.iconSize}
                  className={item.className}
                  onClick={item.onClick}
                  disabled={item.disabled}
                />
              ))}
            </div>
            )}
            {openFontSizePopper && (
              <FontSizeDropdown
                inputFontSizeRef={inputFontSizeRef}
                inputFocused={inputFocused}
                fontSizeValue={fontSizeValue}
                setOpenFontSizePopper={setOpenFontSizePopper}
                handleUpdateFontSize={handleUpdateFontSize}
                renderCheckedActiveFont={renderCheckedActiveFont}
                prefixClass="FreeTextPaletteHeader"
              />
            )}
          </div>
        </div>
      </div>
    </div>

  );
}

FreeTextPaletteHeader.propTypes = {
  style: PropTypes.object.isRequired,
  colorPalette: PropTypes.oneOf(['TextColor', 'StrokeColor', 'FillColor']),
  colorMapKey: PropTypes.string.isRequired,
  onStyleChange: PropTypes.func.isRequired,
  annotation: PropTypes.object,
  isAnnotationStylePopup: PropTypes.bool,
};

FreeTextPaletteHeader.defaultProps = {
  colorPalette: 'TextColor',
  annotation: {},
  isAnnotationStylePopup: false,
};

export default FreeTextPaletteHeader;
