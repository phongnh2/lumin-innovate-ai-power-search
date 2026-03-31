import { css } from '@emotion/react';

import { mediaQuery } from '@/lib/emotion/mediaQuery';
import { Colors } from '@/ui';

export const wrapperCss = css`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  width: 100vw;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10000;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
`;

export const containerCss = css`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const progressBarCss = css`
  width: 80px;
  height: 3px;
  border-radius: 99px;
  background: ${Colors.SECONDARY_20};
  overflow: hidden;
  ${mediaQuery.md`
    width: 160px;
    height: 6px;
  `}
`;

export const progressBarTrackCss = css`
  width: 0;
  background: ${Colors.SECONDARY_50};
  height: 6px;
`;

export const whiteBackgroundCss = css`
  background: ${Colors.WHITE};
`;

export const loadingImageCss = css`
  width: 100px;
  height: auto;
  ${mediaQuery.md`
    width: 200px;
  `}
`;
