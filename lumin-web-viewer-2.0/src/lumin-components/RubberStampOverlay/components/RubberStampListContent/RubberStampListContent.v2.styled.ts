import { spacings, typographies } from 'constants/styles/editor';
import { css } from 'styled-components';

export const emptyContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--base-gap-2x);
  padding: var(--base-gap-2x) 0 var(--base-gap-3x);
  text-align: center;
  ${typographies.le_body_medium};
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const listItems = css`
  & > :not(:last-child) {
    margin-bottom: ${spacings.le_gap_1}px;
  }
`;
