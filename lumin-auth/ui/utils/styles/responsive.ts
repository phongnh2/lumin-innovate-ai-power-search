import { css } from '@emotion/react';

import { mediaQueryDown } from '../media-query';

export const desktopUpCss = css`
  ${mediaQueryDown.xl} {
    display: none;
  }
`;

export const tabletUpCss = css`
  ${mediaQueryDown.md} {
    display: none;
  }
`;
