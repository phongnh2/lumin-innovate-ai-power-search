import omitBy from 'lodash/omitBy';

import core from 'core';

import getRichTextCSSStyle from 'helpers/getRichTextCSSStyle';
import resizeFreetextToFitContent from 'helpers/resizeFreetextToFitContent';

export const TEXT_DECORATION = 'text-decoration';

export class TextDecorationBtnUtils {
  static updateRichTextStyle = (annotation, richStyle) => {
    const richTextStyle = getRichTextCSSStyle(annotation.getContents(), richStyle);
    if (richTextStyle) {
      annotation.setRichTextStyle(richTextStyle);
    }
    core.getAnnotationManager().redrawAnnotation(annotation);
  };

  static getCssPropertyName = (key) =>
    ({
      bold: 'font-weight',
      italic: 'font-style',
      word: TEXT_DECORATION,
      'line-through': TEXT_DECORATION,
    }[key]);

  static checkExistedFontStyle(styleList, key) {
    const isActive = styleList.some((style) => String(style || '').includes(key));
    return {
      isActive,
      styleStatus: isActive ? 'active' : '',
    };
  }

  static applyFontStyle = ({ key, objRichStyleKeys, richStyle, annotation, propertyName, onChange = () => {} }) => {
    const newFontStyle = objRichStyleKeys?.[0] ? [...objRichStyleKeys, key] : [key];

    if (annotation instanceof window.Core.Annotations.FreeTextAnnotation && propertyName) {
      const updatedPropertyValue =
        propertyName === TEXT_DECORATION ? `${richStyle[propertyName] || ''} ${key}`.trim() : key;
      const updatedRichStyle = {
        ...richStyle,
        [propertyName]: updatedPropertyValue,
      };
      TextDecorationBtnUtils.updateRichTextStyle(annotation, updatedRichStyle);
    }

    onChange(newFontStyle);
    resizeFreetextToFitContent(annotation);
  };

  static _removeFontStyleFromList = (fontStyleList, key) =>
    fontStyleList?.filter((_fontValue) => {
      const fontValue = String(_fontValue || '');
      return !fontValue.includes(key) || fontValue.replaceAll(key, '').trim();
    }) || [];

  static _getUpdatedRichStyle({ richStyle, propertyName, key }) {
    const finalProperties = richStyle[propertyName]?.replaceAll(key, '').trim();
    const newRichStyle = { ...richStyle };
    newRichStyle[propertyName] = finalProperties;
    return omitBy(newRichStyle, (value) => !value);
  }

  static deleteFontStyle = ({ key, objRichStyleKeys, richStyle, annotation, propertyName, onChange }) => {
    const newFontStyle = TextDecorationBtnUtils._removeFontStyleFromList(objRichStyleKeys, key);

    if (annotation instanceof window.Core.Annotations.FreeTextAnnotation) {
      const updatedRichStyle = TextDecorationBtnUtils._getUpdatedRichStyle({ richStyle, propertyName, key });
      TextDecorationBtnUtils.updateRichTextStyle(annotation, updatedRichStyle);
    }
    onChange?.(newFontStyle);
  };

  static toggleFontStyle = ({ key, annotation, onChange = () => {} }) => {
    const annotationContentLength = annotation.getContents()?.length;
    const defaultStyle = annotation.getRichTextStyle();

    if (!Object.prototype.hasOwnProperty.call(defaultStyle, annotationContentLength)) {
      defaultStyle[annotationContentLength] = {};
    }

    const richStyle = defaultStyle[Object.keys(defaultStyle)[0]];

    const objRichStyleKeys = Object.values(richStyle);

    const propertyName = TextDecorationBtnUtils.getCssPropertyName(key);

    const fontStyleParam = {
      key,
      objRichStyleKeys,
      richStyle,
      annotation,
      propertyName,
      onChange,
    };

    if (
      objRichStyleKeys === undefined ||
      !TextDecorationBtnUtils.checkExistedFontStyle(objRichStyleKeys, key).isActive
    ) {
      TextDecorationBtnUtils.applyFontStyle({ ...fontStyleParam });
      return;
    }
    TextDecorationBtnUtils.deleteFontStyle({ ...fontStyleParam });
  };
}
