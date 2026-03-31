import { css } from '@emotion/react';

import { FADEIN_TIME } from '@/constants/common';
import { mediaQuery } from '@/lib/emotion/mediaQuery';
import { BorderRadius } from '@/ui';

export const containerCss = css`
  border-radius: ${BorderRadius.Primary};
  width: 100%;
  position: relative;
  z-index: 1;
`;

export const highlightAnimationCss = css`
  position: absolute;
  top: -8px;
  left: -16px;
  right: -16px;
  bottom: -8px;
  z-index: -1;
  border-radius: ${BorderRadius.Primary};
  background-color: var(--color-primary-20);
  animation: fadeout-bg ${FADEIN_TIME / 1000}s;
  animation-delay: 3000ms;
  animation-fill-mode: forwards;
  ${mediaQuery.md`
    top: -16px;
    bottom: -16px;
  `}
`;

export const buttonGroupCss = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const passwordLabelContainerCss = css`
  display: flex;
  justify-content: flex-end;
`;

export const passwordTitleGroupCss = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;
