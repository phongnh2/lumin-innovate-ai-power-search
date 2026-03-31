import { css } from '@emotion/react';

import { BorderRadius, Colors } from '../theme';

export const containerCss = css`
  padding: 8px 16px;
  background: ${Colors.SECONDARY_10};
  border-radius: ${BorderRadius.Primary};
  position: relative;
  font-size: 12px;
  line-height: 16px;
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 0;
    width: 2px;
    background-color: ${Colors.SECONDARY_50};
    border-radius: 999px;
  }
`;
