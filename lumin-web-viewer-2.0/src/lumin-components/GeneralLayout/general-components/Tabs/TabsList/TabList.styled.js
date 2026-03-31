import styled from 'styled-components';
import { TabsList as BaseTabsList } from '@mui/base/TabsList';
import { THEME_MODE } from 'constants/lumin-common';
import { colors } from 'constants/styles/editor';

export const tabListTheme = {
  [THEME_MODE.LIGHT]: {
    le_main_surface_container: colors.themes.light.le_main_surface_container,
  },
  [THEME_MODE.DARK]: {
    le_main_surface_container: colors.themes.dark.le_main_surface_container,
  },
};

export const TabsList = styled(BaseTabsList)`
  border-radius: 99999px;

  display: flex;
  align-items: center;
  justify-content: center;
  align-content: space-between;
`;
