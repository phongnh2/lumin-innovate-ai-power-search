import { css } from '@emotion/react';

import { mediaQuery } from '@/lib/emotion/mediaQuery';
import { Colors } from '@/ui';
import { Fonts } from '@/ui/utils/font.enum';

export const crashContainerCss = css`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin: 65px auto auto;
  padding: 0 16px;
  ${mediaQuery.md`
    margin-top: 67px;
  `}
`;

export const crashImageCss = css`
  width: 204px;
  display: block;
  height: auto;
  ${mediaQuery.md`
    width: 320px;
  `}
`;
export const titleCss = css`
  margin-top: 24px;
  font-family: ${Fonts.Primary};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
  ${mediaQuery.md`
    margin-top: 48px;
    font-size: 24px;
    line-height: 32px;
  `}
`;
export const messageCss = css`
  font-family: ${Fonts.Primary};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: ${Colors.NEUTRAL_80};
  margin-top: 12px;
  margin-bottom: 24px;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;
