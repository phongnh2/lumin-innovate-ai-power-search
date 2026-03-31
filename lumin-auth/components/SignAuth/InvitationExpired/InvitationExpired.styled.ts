import { css } from '@emotion/react';

import { mediaQuery } from '@/lib/emotion/mediaQuery';
import { Colors } from '@/ui';

export const containerCss = css`
  min-height: 100vh;
  display: grid;
  grid-template-rows: 72px minmax(0, 1fr);
  grid-template-columns: minmax(0, 1fr);
`;

export const headerCss = css`
  padding: 0 24px;
  display: flex;
  align-items: center;
`;

export const bodyCss = css`
  padding: 60px 16px 0;
  text-align: center;
  position: relative;

  ${mediaQuery.md`
    padding-top: 120px;
  `}

  ${mediaQuery.xl`
    padding-top: 84px;
  `}
`;

export const imageCss = css`
  width: 100%;
  height: auto;
  ${mediaQuery.md`
    max-width: 527px;
  `}
`;

export const titleCss = css`
  font-size: 17px;
  line-height: 24px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  margin: 16px 0 12px;

  ${mediaQuery.md`
    font-size: 24px;
    line-height: 32px;
  `}
`;

export const descriptionCss = css`
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  margin: 0 0 24px;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;
