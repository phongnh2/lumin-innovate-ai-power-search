import styled, { css } from 'styled-components';
import MenuList from '@mui/material/MenuList';
import MenuItem from 'lumin-components/Shared/MenuItem';
import { typographies } from 'constants/styles/editor';
import ButtonSuffixInput from 'lumin-components/GeneralLayout/general-components/ButtonSuffixInput';

export const ZoomMenuItem = styled(MenuItem)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  min-height: 32px;

  ${{ ...typographies.le_body_medium }};
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
    &:hover {
        background-color: ${theme.le_state_layer_on_surface_hovered}!important;
        color: ${theme.le_main_on_surface}!important;
    }
  `}
`;

export const Shortcut = styled.div`
  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
  `}
`;

export const ZoomMenuList = styled(MenuList)`
  width: 160px;
  padding: 8px;
  hr {
    margin: 0 8px;
  }
`;
