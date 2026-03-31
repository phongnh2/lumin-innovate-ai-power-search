import styled from 'styled-components';
import Button from '@mui/material/Button';
import { MenuList, MenuItem } from '@mui/material';
import { THEME_MODE } from 'constants/lumin-common';
import { DarkTheme, LightTheme } from 'constants/styles';

export const Theme = {
  [THEME_MODE.LIGHT]: LightTheme,
  [THEME_MODE.DARK]: DarkTheme,
};

export const SortFilterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  padding: 6px 8px;
  transition: background-color 0.3s ease;
  background-color: ${({ theme }) => theme.PANEL_BG};
  border-bottom: 1px solid ${({ theme }) => theme.COPY_DOCUMENT.DIVIDER};
`;

export const Title = styled.div`
    font-family: var(--font-primary);
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    color: ${({ theme }) => theme.PRIMARY_TEXT};
`;

export const FilterButton = styled(Button)`
  padding: 4px 12px;
  border-radius: 4px;
  text-transform: none;
  width: max-content;
  font-size: 14px;
  line-height: 20px;
  box-shadow: ${({ isSelecting }) => (isSelecting ? 'inset 0px 0px 12px rgba(16, 45, 66, 0.16)' : 'none')};
  background-color: ${({ isSelecting, theme }) => (isSelecting ? theme.FILTER_SELECTING : theme.PANEL_BG)};
  color: ${({ theme, isSelecting }) => (isSelecting ? theme.NOTE.FILTER_SELECTED_TEXT : theme.NOTE.SELECTED_NUMBER)};
  :hover {
    background-color: ${({ theme }) => theme.FILTER_HOVER};
  }
`;

export const Divider = styled.div`
  height: 1px;
  background:  ${({ theme }) => theme.NOTE.DIVIDER};
`;

export const List = styled(MenuList)`
  padding: 0;
`;

export const Item = styled(MenuItem)`
  height: 36px;
  display: flex;
  justify-content: space-between;
  align-content: center;
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.NOTE.DROPDOWN_TEXT};
  :hover {
    background-color: ${({ theme }) => theme.FILTER_HOVER};
  }
`;
