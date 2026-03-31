import Button from '@mui/material/Button';
import styled, { css } from 'styled-components';
import { ICON_BTN_ACTIVE_STYLE, ICON_BTN_SIZE } from "./constants";

const getStyleBySize = (size) => {
  switch (size) {
    case ICON_BTN_SIZE.LG: {
      return css`
        border-radius: var(--lumin-border-radius-md);
        height: 40px;
        width: 40px;
        min-width: 40px;
      `;
    }
    case ICON_BTN_SIZE.SM: {
      return css`
        border-radius: var(--lumin-border-radius-sm);
        height: 20px;
        width: 20px;
        min-width: 20px;
      `;
    }
    case ICON_BTN_SIZE.MD:
    default: {
      return css`
        border-radius: var(--lumin-border-radius-md);
        height: 32px;
        width: 32px;
        min-width: 32px;
      `;
    }
  }
};

export const IconButton = styled(Button)`
  padding: 4px;
  border-radius: 8px;
  ${({ $size }) => getStyleBySize($size)};
  ${({ theme, $active, $activeStyle }) => css`
    color: ${theme.le_main_on_surface_variant};
    &.Mui-disabled {
      color: ${theme.le_disable_on_container};
    }
    &:hover {
      background-color: ${theme.le_state_layer_on_surface_variant_hovered};
    }
    ${
      $active
        ? css`
        background-color: ${theme.le_main_primary_container};
        color: ${theme.le_main_on_surface};
        position: relative;
        :before {
          position: absolute;
          content: '';
          left: 0;
          height: 60%;
          width: 2px;
          top: 50%;
          transform: translateY(-50%);
          background: ${$activeStyle === ICON_BTN_ACTIVE_STYLE.NORMAL ? 'transparent' : theme.le_main_primary};
          border-radius: 9999px;
        }
      `
        : ''
    }
  `}
`;

