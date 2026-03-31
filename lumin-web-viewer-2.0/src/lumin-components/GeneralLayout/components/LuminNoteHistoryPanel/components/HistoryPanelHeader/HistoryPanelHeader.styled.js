import styled, { css } from 'styled-components';

import Menu, { MenuItem } from '@new-ui/general-components/Menu';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import Icomoon from'lumin-components/Icomoon';

import { typographies, spacings } from 'constants/styles/editor';

export const HeaderContainer = styled.div`
  top: 0;
  left: 0;
  z-index: 1;
  position: absolute;
  width: 100%;
  ${({ theme }) => `
    border-bottom: 1px solid ${theme.le_main_outline_variant};
  `};
`;

export const HeaderWrapper = styled.div`
  width: 100%;
  padding: ${spacings.le_gap_1}px ${spacings.le_gap_1_5}px;
  display: flex;
  justify-content: space-between;
  background-color: transparent;
  align-items: center;
`;

export const HeaderTitle = styled.span`
  ${{ ...typographies.le_title_small }};
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const ButtonGroup = styled.div`
  width: 68px;
  display: flex;
  justify-content: space-between;

  span {
    margin: ${spacings.le_gap_0}px !important;
  }
`;

export const SortButton = styled(IconButton)`
  width: 32px;
  height: 32px;
  min-width: 32px;
  i {
    color: ${({ theme }) => theme.le_main_on_surface_variant};
    font-size: 24px;
  }
`;

export const ClosePanelButton = styled(IconButton)`
  width: 32px;
  height: 32px;
  min-width: 32px;
  i {
    color: ${({ theme }) => theme.le_main_on_surface_variant};
    font-size: 24px;
  }
`;

export const ListContainer = styled(Menu)`
  width: 200px;
  ${({ theme, $isExpandList }) => css`
    background-color: ${theme.le_main_surface_container_low};
    width: ${$isExpandList ? 'var(--lumin-comment-panel-width)' : '200px'};
  `}
`;

export const CustomMenuItem = styled(MenuItem)`
  width: 100%;
  position: relative;
  white-space: inherit;
  ${({ theme, $isExpanded }) => $isExpanded && `background-color: ${theme.le_state_layer_on_surface_hovered}`}
`;

export const MenuContent = styled.span`
  margin-left: ${spacings.le_gap_4}px;
  ${{ ...typographies.le_body_medium }};
`;

export const CustomDivider = styled.div`
  width: 100%;
  height: 1px;
  margin: ${spacings.le_gap_1}px 0;
  ${({ theme }) => `
    background-color: ${theme.le_main_outline_variant};
  `}
`;

export const CustomIcon = styled(Icomoon)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $isExpandIcon }) => `
    ${!$isExpandIcon ? `left: ${spacings.le_gap_1}px;` : `right: ${spacings.le_gap_1}px;`}
  `}
`;
