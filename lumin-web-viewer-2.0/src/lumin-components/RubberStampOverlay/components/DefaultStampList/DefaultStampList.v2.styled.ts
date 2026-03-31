import { css } from 'styled-components';

import { STANDARD_STAMP_HEIGHT_DEFAULT } from 'luminComponents/RubberStampOverlay/constants';

import { spacings } from 'constants/styles/editor';

export const container = css`
  margin: var(--base-gap) calc(var(--base-gap-2x) * -1) 0;
  width: calc(100% + var(--base-gap-2x) * 2);
`;

export const list = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--base-gap);
  padding: 0 var(--base-gap-2x);
`;

export const item = css`
  background-color: ${({ theme }) => theme.le_signature_signature_container};
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${spacings.le_gap_1_5 * 2 + STANDARD_STAMP_HEIGHT_DEFAULT}px;
  border-radius: var(--border-radius-primary);
  img {
    max-width: 84px;
    max-height: ${STANDARD_STAMP_HEIGHT_DEFAULT}px;
  }
`;

export const itemDragging = css`
  background-color: transparent;
`;

export const itemNotDragging = css`
  transform: translate(0, 0) !important;
  pointer-events: all !important;
`;
