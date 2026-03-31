import MenuList from '@mui/material/MenuList';
import styled from 'styled-components';

import MenuItem from 'lumin-components/Shared/MenuItem';

import { spacings, typographies } from 'constants/styles/editor';

const BaseTitle = styled.p`
  ${{ ...typographies.le_body_medium }};
`;
export const ListMenu = styled(MenuList)`
  padding: 8px;

  .MuiDivider-root {
    margin: 8px 0;
  }
`;

export const ListMenuItem = styled(MenuItem)`
  min-height: 32px;
  min-width: 288px;
  padding-left: 8px;
  ${{ ...typographies.le_body_medium }};
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
    &:hover {
        background-color: ${theme.le_state_layer_on_surface_hovered}!important;
        color: ${theme.le_main_on_surface}!important;
    }
  `}
  > i {
    margin-right: 8px;
    width: 24px;
  }
`;

export const SwitchWrapper = styled.div`
  right: 0;
  position: absolute;
`;

export const SubTitle = styled(BaseTitle)`
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
  `}
  ${typographies.le_title_small}
  overflow-wrap: break-word;
  padding-right: ${spacings.le_gap_1}px;
  word-wrap: break-word;
`;

export const Content = styled(BaseTitle)`
  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
  `}
  word-wrap: break-word;
`;

export const Divider = styled.div`
  height: 1px;
  width: 100%;
  ${({ theme }) => `
    background-color: ${theme.le_main_outline_variant};
  `}
`;

export const StorageLabel = styled.span`
  ${{ ...typographies.le_label_medium }};
  ${({ theme }) => `
    background-color: ${theme.le_main_outline_variant};
  `}
`;

export const StorageWrapper = styled.div`
  display: flex;
  gap: 4px;
`;

export const SwitchThemeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: var(--kiwi-spacing-1);
`;

export const BetaTag = styled.p`
  border-radius: 4px;
  background-color:  ${({ theme }) => theme.le_lumin_brand_lumin_brand};
  pointer-events: none;
  color: ${({ theme }) => theme.le_main_on_primary};
  padding: 4px;
  ${{ ...typographies.le_label_small }};

`;