import styled from 'styled-components';
import Button from '@mui/material/Button';
import { MenuList, MenuItem } from '@mui/material';
import { THEME_MODE } from 'constants/lumin-common';
import { DarkTheme, LightTheme, Colors } from 'constants/styles';

export const Theme = {
  [THEME_MODE.LIGHT]: LightTheme,
  [THEME_MODE.DARK]: DarkTheme,
};

export const FilterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  padding: 6px 8px;
  background-color: ${({ theme }) => theme.PANEL_BG};
  transition: background-color 0.3s ease;
`;

export const FilterButton = styled(Button)`
  padding: 4px 12px;
  border-radius: 4px;
  text-transform: none;
  width: max-content;
  font-size: 14px;
  line-height: 20px;
  box-shadow: ${({ selected }) => (selected ? 'inset 0px 0px 12px rgba(16, 45, 66, 0.16)' : 'none')};
  background-color: ${({ selected, theme }) => (selected ? theme.FILTER_SELECTING : theme.PANEL_BG)};
  color: ${({ theme, selected }) => (selected ? theme.NOTE.FILTER_SELECTED_TEXT : theme.NOTE.SELECTED_NUMBER)};
  transition: background-color .3s ease;

  :hover {
    background-color: ${({ theme }) => theme.FILTER_HOVER};
  }
`;

export const MyNoteToExportContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.NOTE.SELECTED_NUMBER};
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
`;

export const MyNoteToExportButton = styled(Button)`
  border-radius: 8px;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.NOTE.EXPORT_BUTTON};
  background: ${({ theme }) => theme.NOTE.EXPORT_BUTTON_BG} ;
  padding: 8px 16px;
  text-transform: none;
`;

export const SelectedNoteNumber = styled.p`
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.NOTE.SELECTED_NUMBER};
`;

export const SelectAllButton = styled(Button)`
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.SECONDARY_50};
  background: transparent;
  text-transform: none;
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
  place-content: center space-between;
  color: ${({ theme }) => theme.NOTE.DROPDOWN_TEXT};
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;

  :hover {
    background-color: ${({ theme }) => theme.FILTER_HOVER};
  }
`;
