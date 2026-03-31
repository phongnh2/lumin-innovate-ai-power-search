import { css } from '@emotion/react';

import { mediaQuery } from '@/lib/emotion/mediaQuery';
import { mediaQueryDown, mediaQueryUp } from '@/ui';

export const footerCss = css`
  display: grid;
  padding: 0 16px 24px 16px;
  ${mediaQueryDown.md} {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 20px 32px;
    gap: 8px 16px;
    padding-bottom: 24px;
  }
  ${mediaQueryUp.md} {
    grid-template-columns: repeat(3, auto);
    grid-template-rows: none;
    gap: 16px;
    justify-content: flex-end;
    align-items: center;
    padding-right: 32px;
  }
`;

export const luminLogoCss = css`
  ${mediaQueryDown.md} {
    display: grid;
    justify-content: flex-end;
  }
`;

export const footerCenterCss = css`
  ${mediaQuery.md`
    justify-content: center;
    padding-right: 16px;
  `}
`;

export const footerDescriptionCss = css`
  ${mediaQueryDown.md} {
    grid-column: 1 / 3;
    display: grid;
    text-align: center;
  }
`;
