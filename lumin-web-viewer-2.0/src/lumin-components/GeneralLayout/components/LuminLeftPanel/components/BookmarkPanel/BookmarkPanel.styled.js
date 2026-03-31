import MaterialMenuItem from '@mui/material/MenuItem';
import styled from 'styled-components';

import { typographies } from 'constants/styles/editor';

export const BookmarkPanel = styled.div`
  display: flex;
  flex-direction: column;
  ${({ theme }) => `
    background-color: ${theme.le_main_surface_bright};
  `}
`;

export const BookmarkPanelHeader = styled.div`
`;

export const BookmarkList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const BookmarkItem = styled(MaterialMenuItem)`
  display: flex;
  flex-direction: column;
  padding: 12px;
  align-items: flex-start;

  ${({ theme }) => `
        &:hover {
            background-color: ${theme.le_state_layer_on_surface_hovered};
        }
    `}
`;

export const BookmarkTitle = styled.span`
  ${{ ...typographies.le_label_medium }};
  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
  `}
  margin-bottom: 2px;
`;

export const BookmarkContent = styled.span`
  ${{ ...typographies.le_label_small }};
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
  `}
`;

export const InfoWrapper = styled.div`
  background: ${({ theme }) => theme.kiwi_colors_core_secondary_container};
  border-radius: var(--kiwi-border-radius-md);
  padding: var(--kiwi-spacing-2) var(--kiwi-spacing-1-5);
  margin: var(--kiwi-spacing-1);
`;
