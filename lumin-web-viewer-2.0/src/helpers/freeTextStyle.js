import core from 'core';

function checkExistedAndActiveFontStyle(styleList, key) {
  return styleList.some((textStyle) => String(textStyle || '').includes(key));
}

const renderActiveClass = (styleName = '') => {
  const selectedAnnotation = core.getSelectedAnnotations()[0];

  const defaultStyle = selectedAnnotation && selectedAnnotation.getRichTextStyle();

  if (defaultStyle) {
    const richStyle = defaultStyle[Object.keys(defaultStyle)[0]];
    const objRichStyleKeys = Object.values(richStyle);
    return checkExistedAndActiveFontStyle(objRichStyleKeys, styleName);
  }
  return false;
};

export { renderActiveClass };
