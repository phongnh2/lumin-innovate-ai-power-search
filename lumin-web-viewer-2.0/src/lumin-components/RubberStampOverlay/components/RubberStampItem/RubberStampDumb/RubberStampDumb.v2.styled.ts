import { spacings } from 'constants/styles/editor';
import { css } from 'styled-components';

export const itemContainer = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: ${spacings.le_gap_1_5}px ${spacings.le_gap_3}px;
  margin: 0 ${spacings.le_gap_2}px;
  background-color: ${({theme}) => theme.le_signature_signature_container};
  border-radius: var(--border-radius-primary);
  &[data-disabled="true"] {
    pointer-events: none;
    cursor: not-allowed;
    opacity: 0.6;
  }

  &[data-dragging="true"] {
    background-color: transparent;

    .rubber-stamp-remove-btn {
      display: none;
    }
  }
`;

export const image = css`
  height: 48px;
`;

export const icon = css`
  position: absolute;
  top: ${spacings.le_gap_1}px;
  right: ${spacings.le_gap_1}px;
  color: ${({theme}) => theme.le_signature_on_signature_container};
`;
