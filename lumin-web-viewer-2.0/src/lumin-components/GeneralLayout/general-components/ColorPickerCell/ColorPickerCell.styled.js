import { ChromePicker } from 'react-color';
import styled, { css } from 'styled-components';

export const PopperContainer = styled.div`
  padding: 8px;
  width: 205px !important;
`;

export const PopperAction = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 16px;
  align-items: center;
`;

export const ChromePickerContainer = styled(ChromePicker)`
  ${({ theme }) => css`
    background-color: transparent !important;
    & label {
      color: ${theme.le_main_on_surface_variant} !important;
      font-size: 12px !important;
      background-color: transparent !important;
    }

    & input {
      box-shadow: none !important;
      border-radius: var(--border-radius-dense) !important;
      padding: 0 !important;
      color: ${theme.le_main_on_surface_variant} !important;
      border: 1px solid ${theme.le_main_outline_variant} !important;
      background-color: transparent !important;
      &:focus {
        outline: none !important;
        box-shadow: 0 0 0 1.2px var(--color-primary-30) !important;
        border: 1px solid ${theme.le_main_outline_variant} !important;
      }
    }

    & svg {
      fill: ${theme.le_main_on_surface_variant} !important;
      background: transparent !important;
      &:hover {
        background: ${theme.le_state_layer_primary_hovered} !important;
      }
    }
  `}
`;
