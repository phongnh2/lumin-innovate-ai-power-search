import { css } from '@emotion/react';

import { mediaQueryUp } from '@/ui';
import { textSizeMap } from '@/ui/Text/utils';

export const containerCss = css`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: center;
`;

export const infoContainerCss = css`
  display: grid;
  gap: 12px;
`;

export const validationMessageCss = css`
  ${textSizeMap.getCss(6)};
  ${mediaQueryUp.md} {
    ${textSizeMap.getCss(5)};
  }
`;
