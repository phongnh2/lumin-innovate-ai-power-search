import { css } from '@emotion/react';

import { BorderRadius, Colors } from '../theme';

export const containerCss = css`
  padding: 16px 12px 16px 16px;
  display: grid;
  grid-template-columns: 30px auto 32px;
  border-radius: ${BorderRadius.Primary};
  align-items: flex-start;
  width: 320px;
`;

export const successCss = css`
  background: ${Colors.SUCCESS_10};
  border: 1px solid ${Colors.SUCCESS_50};
`;

export const errorCss = css`
  background: ${Colors.SECONDARY_10};
  border: 1px solid ${Colors.SECONDARY_50};
`;

export const closeButtonContainerCss = css`
  display: flex;
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
  margin-left: 8px;
  margin-top: -4px;
  align-self: flex-start;
  cursor: pointer;
`;
