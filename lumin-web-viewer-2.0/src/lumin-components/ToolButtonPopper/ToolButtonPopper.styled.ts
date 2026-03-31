import { typographies as kiwiTypographies } from 'lumin-ui/tokens';
import { css } from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const icon = css`
  padding: var(--base-gap);
  max-height: 80px;
`;

export const modalTitle = css`
  ${typographies.le_title_medium}
  text-align: center;
  color: ${(props) => props.theme.le_main_on_surface};
  margin-top: ${spacings.le_gap_2}px;
`;

export const largeModalTitle = css`
  ${kiwiTypographies.kiwi_typography_headline_lg}
  margin-top: 0;
`;

export const modalContent = css`
  ${typographies.le_body_medium}
  text-align: center;
  color: ${(props) => props.theme.le_main_on_surface};
  margin-top: ${spacings.le_gap_0_5}px;
`;

export const modalContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const singleButtonContainer = css`
  width: 100%;
  margin-top: ${spacings.le_gap_2}px;
`;

export const multipleButtonContainer = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--base-gap-2x);
  justify-content: center;
  align-items: stretch;
  width: 100%;
  margin-top: ${spacings.le_gap_2}px;
`;
