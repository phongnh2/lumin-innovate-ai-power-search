import styled from 'styled-components';
import MenuList from '@mui/material/MenuList';
import MenuItem from 'lumin-components/Shared/MenuItem';
import { typographies } from 'constants/styles/editor';

export const ListMenu = styled(MenuList)`
  padding: 8px;
`;

export const ListMenuItem = styled(MenuItem)`
  min-height: 32px;
  min-width: 288px;

  ${{ ...typographies.le_body_medium }};

  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
    &:hover {
        background-color: ${theme.le_state_layer_on_surface_hovered}!important; 
        background: ${theme.le_state_layer_on_surface_hovered}!; 
        color: ${theme.le_main_on_surface}!important;
    }
    &.Mui-disabled {
      color: ${theme.le_disable_on_container}!important;
      opacity: 1!important;
    }
  `}
  > i {
    margin-right: 8px;
  }
`;
