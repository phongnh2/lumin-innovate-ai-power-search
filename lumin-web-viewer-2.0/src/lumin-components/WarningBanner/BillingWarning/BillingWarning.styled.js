import styled, { css } from 'styled-components';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';
import { mediaQuery, mediaQueryDown } from 'utils/styles/mediaQuery';

import * as BannerStyled from '../WarningBanner.styled';
import { colors } from 'constants/styles/editor';

export const theme = {
  [THEME_MODE.LIGHT]: {
    background: Colors.SECONDARY_10,
    text: Colors.SECONDARY_50,
    outlineButtonLabel: Colors.SECONDARY_50,
    outlineButtonBackground: 'white',
    primaryButtonLabel: Colors.NEUTRAL_10,
    primaryButtonBackground: Colors.SECONDARY_50,
    primaryButtonBackgroundHover: null,
    outlineButtonBackgroundHover: null,
    closeButton: Colors.SECONDARY_60,

  },
  [THEME_MODE.DARK]: {
    background: Colors.SECONDARY_60,
    text: Colors.NEUTRAL_10,
    outlineButtonLabel: Colors.NEUTRAL_10,
    outlineButtonBackground: 'transparent',
    primaryButtonLabel: Colors.SECONDARY_50,
    primaryButtonBackground: 'white',
    primaryButtonBackgroundHover: Colors.SECONDARY_10,
    outlineButtonBackgroundHover: Colors.SECONDARY_70,
    closeButton: Colors.SECONDARY_20,
  },
};

export const newLayoutTheme = {
  [THEME_MODE.LIGHT]: {
    background: colors.themes.light.le_error_error_container,
    text: colors.themes.light.le_error_error,
    outlineButtonLabel: colors.themes.light.le_error_error + '!important',
    outlineButtonBackground: 'transparent!important',
    primaryButtonLabel: colors.themes.light.le_error_on_error + '!important',
    primaryButtonBackground: colors.themes.light.le_error_error + '!important',
    primaryButtonBackgroundHover: colors.themes.light.le_error_error + '!important',
    outlineButtonBackgroundHover: 'transparent!important',
    closeButton: colors.themes.light.le_main_on_surface + '!important',

  },
  [THEME_MODE.DARK]: {
    background: colors.themes.dark.le_error_error_container,
    text: colors.themes.dark.le_error_error,
    outlineButtonLabel: colors.themes.dark.le_error_error + '!important',
    outlineButtonBackground: 'transparent!important',
    primaryButtonLabel: colors.themes.dark.le_error_on_error + '!important',
    primaryButtonBackground: colors.themes.dark.le_error_error + '!important',
    primaryButtonBackgroundHover: colors.themes.dark.le_error_error + '!important',
    outlineButtonBackgroundHover: 'transparent!important',
    closeButton:  colors.themes.dark.le_main_on_surface + '!important',
  },
};

const {
  Link, CloseButton,
} = BannerStyled;

export const Container = styled(BannerStyled.Container)`
  height: auto;
  flex-direction: column;
  padding: ${(props) => (props.closable ? 40 : 12)}px 16px 12px;
  background-color: ${(props) => props.theme.background};
  ${mediaQuery.md`
    height: 56px;
    flex-direction: row;
    padding: 0 16px;
    justify-content: flex-start;
    ${(props) => props.closable && `
      padding-right: 56px;
    `}
  `}


  ${mediaQuery.xl`
    justify-content: center;
  `}

  ${mediaQueryDown.md`
    ${CloseButton} {
      top: 12px;
      right: 12px;
      left: auto;
      transform: none;
      width: 24px;
      height: 24px;
    }
  `}
`;
export const Text = styled(BannerStyled.Text)`
  font-size: 12px;
  line-height: 16px;
  color: ${(props) => props.theme.text || Colors.SECONDARY_50};
  font-weight: 600;
  ${mediaQuery.xl`
    font-size: 14px;
    line-height: 20px;
  `}
`;
export const Button = styled(BannerStyled.Button)`
  width: 100%;
  background-color: ${(props) => props.theme.primaryButtonBackground || Colors.SECONDARY_50};
  color: ${(props) => props.theme.primaryButtonLabel || 'white'};
  ${({ $isOutline }) => ($isOutline ? css`
    background-color: ${(props) => props.theme.outlineButtonBackground || 'white'};
    color: ${(props) => props.theme.outlineButtonLabel || Colors.SECONDARY_50};
    border-color: ${(props) => props.theme.outlineButtonLabel || Colors.SECONDARY_50};
    &:hover  {
      background-color: ${(props) => props.theme.outlineButtonBackgroundHover};
    }
  ` : css`
    &:hover {
      background-color: ${(props) => props.theme.primaryButtonBackgroundHover}
    }
  `)}

  ${mediaQuery.md`
    width: auto;
  `}
`;
export const ButtonGroup = styled(BannerStyled.ButtonGroup)`
  display: grid;
  ${(props) => `grid-template-columns: repeat(${props.$columns || 1}, minmax(0, 1fr));`}
  gap: 16px;
  width: 100%;
  margin-top: 16px;
  && ${Button} {
    margin: 0;
  }
  ${mediaQuery.md`
    margin-top: 0;
    display: flex;
    gap: 0;
    width: auto;

    && ${Button} + ${Button} {
      margin-left: 16px;
    }
  `}
`;
export {
  Link,
};
