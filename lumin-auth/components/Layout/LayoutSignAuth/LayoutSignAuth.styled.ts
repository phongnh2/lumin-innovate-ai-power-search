import { css } from '@emotion/react';

import { mediaQueryUp } from '@/ui';
import { textSizeMap } from '@/ui/Text/utils';

export const titleCss = css`
  margin-bottom: 24px;
  ${textSizeMap.getCss(2)};
  ${mediaQueryUp.md} {
    ${textSizeMap.getCss(1)};
  }
`;

export const titleWithSubTitleCss = css`
  ${titleCss}
  margin-bottom: 4px;
`;

export const subTextCss = css`
  ${textSizeMap.getCss(5)}
  margin-bottom: 24px;
`;

export const mainCss = css`
  --padding: 16px;
  margin: 0 auto;
  padding: 12vh var(--padding) 32px;
  min-height: calc(100vh - var(--footer-height));
`;

export const mainLayout = css`
  ${mainCss}
  max-width: calc(400px + var(--padding) * 2);
`;

export const verifyLayout = css`
  ${mainCss}
  max-width: 100vw;
`;
