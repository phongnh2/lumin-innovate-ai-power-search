import styled, { css } from 'styled-components';

import Menu from '@new-ui/general-components/Menu';

import MenuItem from 'lumin-components/Shared/MenuItem';
import ButtonIcon from 'luminComponents/Shared/ButtonIcon';
import { Colors } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';

const lightTheme = {
  backgroundActiveItem: Colors.PRIMARY_20,
  menuButtonBg: Colors.NEUTRAL_0,
  menuButtonHoverBg: Colors.NEUTRAL_20,
  title: Colors.NEUTRAL_100,
  label: Colors.NEUTRAL_80,
  line: Colors.NEUTRAL_100,
};

const darkTheme = {
  backgroundActiveItem: Colors.NEUTRAL_90,
  menuButtonBg : Colors.NEUTRAL_100,
  menuButtonHoverBg : Colors.NEUTRAL_60,
  title: Colors.NEUTRAL_5,
  label: Colors.NEUTRAL_10,
  line: Colors.NEUTRAL_80,

};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const HighlightList = styled(Menu)`
  padding: 0;
`;

const ItemActiveCss = css`
  background: ${({ theme }) => theme.backgroundActiveItem};
  &:hover {
    background: ${({ theme }) => theme.backgroundActiveItem};
  }
`;

export const HighlightItem = styled(MenuItem)`
  padding: 8px;
  min-width: 274px;
  margin: 0 8px;
  border-radius: var(--border-radius-primary);
  overflow: visible;
  ${({ active }) => active && ItemActiveCss}
`;

export const ToolTitle = styled.span`
  padding: 0 8px;
  min-width: 181px;
  display: flex;
  align-items: center;
`;

export const ToolIcon = styled.div`
  padding: 3px;
`;

export const MenuButton = styled(ButtonIcon)`
  background: ${({ theme }) => theme.menuButtonBg};
  &:hover {
    background: ${({ theme }) => theme.menuButtonHoverBg};
  }
`;