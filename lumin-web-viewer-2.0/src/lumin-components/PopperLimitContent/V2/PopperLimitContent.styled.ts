import { spacings, typographies } from 'constants/styles/editor';
import { css } from 'styled-components';

export const container = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
`;

export const title = css`
  text-align: center;
  margin-top: ${spacings.le_gap_2}px;
  color: ${({ theme }) => theme.le_main_on_surface};
  ${typographies.le_title_large}
`;

export const message = css`
  text-align: center;
  margin-top: ${spacings.le_gap_0_5}px;
  color: ${props => props.theme.le_main_on_surface_variant};
  ${typographies.le_body_medium}
`;

export const buttonGroup = css`
  width: 100%;
  margin-top: ${spacings.le_gap_2}px;
`;
