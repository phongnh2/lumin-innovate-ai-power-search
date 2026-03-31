import { css } from '@emotion/react';

import { FADEIN_TIME } from '@/constants/common';
import { BorderRadius, Colors } from '@/ui';

export const wrapperCss = css`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export const providerWrapperCss = css`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const messageCss = css`
  text-align: center;
  color: ${Colors.NEUTRAL_80};
`;

export const boldCss = css`
  color: ${Colors.NEUTRAL_100};
`;

export const containerBgCss = css`
  border-radius: ${BorderRadius.Primary};
  width: 100%;
  position: relative;
  padding: 16px 0;
`;

export const highlightAnimationCss = css`
  position: absolute;
  top: 0px;
  left: -24px;
  right: -24px;
  bottom: 0px;
  z-index: -1;
  border-radius: ${BorderRadius.Primary};
  background-color: var(--color-primary-20);
  animation: fadeout-bg ${FADEIN_TIME / 1000}s;
  animation-delay: 5000ms;
  animation-fill-mode: forwards;
`;

export const fadeinVerticalBarCss = css`
  visibility: hidden;
  animation: fadein-verticalBar ${FADEIN_TIME / 1000}s;
  animation-delay: 5000ms;
  animation-fill-mode: forwards;
`;

export const sectionContainerCss = css`
  margin: 24px 0px;
  border-radius: ${BorderRadius.Primary};
  width: 100%;
  position: relative;
  z-index: 1;

  & > section:not(:last-of-type) {
    border-bottom: 1px solid ${Colors.NEUTRAL_20};
  }
`;
