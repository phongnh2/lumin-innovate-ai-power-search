import { opacities, spacings, typographies } from 'constants/styles/editor';
import { css } from 'styled-components';

export const container = css`
  width: 100%;
  padding: 16px;
`;

export const checkboxLabel = css`
  ${typographies.le_body_small};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  height: 40px;
  margin-left: -6px;
  color: ${({ theme }) => theme.le_main_on_surface};
  &[data-disabled='true'] {
    opacity: ${opacities.le_opacity_on_container_disable};
  }
`;
