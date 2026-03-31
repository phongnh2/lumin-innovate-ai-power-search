import { SerializedStyles, css } from '@emotion/react';

import { TextLevel } from '../interfaces';

type FontStyle = {
  fontSize: string;
  lineHeight: string;
};

const map = new Map<TextLevel, FontStyle>([
  [1, { fontSize: '29px', lineHeight: '36px' }],
  [2, { fontSize: '24px', lineHeight: '32px' }],
  [3, { fontSize: '20px', lineHeight: '28px' }],
  [4, { fontSize: '17px', lineHeight: '24px' }],
  [5, { fontSize: '14px', lineHeight: '20px' }],
  [6, { fontSize: '12px', lineHeight: '16px' }],
  [7, { fontSize: '10px', lineHeight: '12px' }]
]);

const textSizeMap = {
  get(level: TextLevel): FontStyle {
    return map.get(level) as FontStyle;
  },
  getCss(level: TextLevel): SerializedStyles {
    return css(map.get(level) as FontStyle);
  }
};

export default textSizeMap;
