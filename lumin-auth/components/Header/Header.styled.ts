import { css } from '@emotion/react';

import { Colors, mediaQueryDown, mediaQueryUp } from '@/ui';

export const headerCss = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--header-height);
  ${mediaQueryUp.md} {
    padding: 0 32px;
  }
`;

export const guestHeaderCss = css`
  background: white;
  border-bottom: 1px solid ${Colors.NEUTRAL_20};
  ${mediaQueryUp.xl} {
    border-bottom: none;
  }
  ${mediaQueryUp.xl} {
    background: transparent;
  }
`;

export const authenticatedHeaderCss = css`
  background-color: white;
  border-bottom: 1px solid ${Colors.OTHER_6};
  ${mediaQueryDown.md} {
    padding: 0 16px;
  }
`;

export const authenticatedLogoCss = css`
  width: auto;
  padding-top: 14px;
  ${mediaQueryUp.lg} {
    padding-top: 10px;
  }
  ${mediaQueryDown.md} {
    padding-top: 16px;
  }
`;

export const headerRightCss = css`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export const leftHeaderCss = css`
  height: 100%;
  display: grid;
  gap: 8px;
  grid-template-columns: auto auto;
`;

export const logoImageCss = css`
  height: 32px;
  width: auto;
`;

export const logoCss = css`
  height: 28px;
  display: block;
  width: auto;
  ${mediaQueryUp.lg} {
    height: 32px;
  }
  ${mediaQueryDown.md} {
    height: 24px;
  }
`;

export const headingCss = css`
  color: ${Colors.NEUTRAL_100};
  font-size: 22px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  padding-top: 23px;
  ${mediaQueryDown.md} {
    padding-top: 25px;
    font-size: 18px;
  }
`;
