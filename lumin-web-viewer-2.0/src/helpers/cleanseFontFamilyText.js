import { STYLE_SUFFIX_FOR_FONT_FAMILY } from '../constants/customConstant';

const cleanseFontFamilyText = (fontFamily = '') => {
  let _fontFamily = fontFamily;

  for (let i = 0; i < STYLE_SUFFIX_FOR_FONT_FAMILY.length; i++) {
    const item = STYLE_SUFFIX_FOR_FONT_FAMILY[i];
    const removeIndex = fontFamily.indexOf(item);
    if (removeIndex !== -1) {
      _fontFamily = fontFamily.substring(0, removeIndex);
      break;
    }
  }

  return _fontFamily;
};

export default cleanseFontFamilyText;
