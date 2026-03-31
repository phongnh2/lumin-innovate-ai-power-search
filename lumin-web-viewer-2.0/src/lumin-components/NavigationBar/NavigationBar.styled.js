import { IconButton as BaseIconButton } from '@mui/material';
import { IconButton as KiwiIconButton } from 'lumin-ui/kiwi-ui';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import PopperButton from 'lumin-components/PopperButton';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles/Colors';
import { typographies } from 'constants/styles/editor';

const getButtonHoverBackground = (props) =>
  ({
    [THEME_MODE.LIGHT]: Colors.NEUTRAL_10,
    [THEME_MODE.DARK]: Colors.NEUTRAL_80,
  }[props.theme.themeMode]);

export const Container = styled.div`
  padding: 16px 20px 16px 8px;
  position: sticky;
  left: 0;
  right: 0;
  top: 0;
  z-index: 110;
  background-color: #fff;
  box-sizing: border-box;
  border-bottom: var(--border-secondary);
  height: 72px;
  ${mediaQuery.md`
    padding-left: 16px;
  `}
  ${mediaQuery.xl`
    max-width: calc(50% + var(--app-container-width) / 2 + 48px);
    margin-left: auto;
    width: 100%;
    padding-left: 48px;
    border-bottom: none;
    height: auto;
  `}
`;
export const TopHeader = styled.div`
  display: none;
  ${mediaQuery.xl`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
    &:empty {
      margin-bottom: 0;
    }
  `}
`;
export const Body = styled.div`
  display: grid;
  align-items: center;
  justify-content: flex-end;
  grid-template-columns: minmax(0, 1fr) max-content;
  column-gap: 24px;
`;
export const BodyReskin = styled.div`
  display: grid;
  align-items: center;
  justify-content: flex-end;
  grid-template-columns: ${(props) =>
    props.$displayFullItems ? 'minmax(0, var(--sub-sidebar-width)) minmax(0, 1fr) max-content' : 'minmax(0, 1fr) max-content'};
  column-gap: var(--kiwi-spacing-2);
`;
export const Title = styled.h1`
  color: var(--color-neutral-100);
  font-weight: 600;
  font-size: 17px;
  line-height: 1.33;
  text-overflow: ellipsis;
  overflow: hidden;
  ${mediaQuery.md`
    font-size: 20px;
  `}
  ${mediaQuery.xl`
    font-size: 24px;
  `}
`;
export const Left = styled.div`
  display: flex;
  align-items: center;

  ${mediaQuery.xl`
    display: block;
  `}
`;
export const HamburgerButton = styled(BaseIconButton)`
  margin-right: 8px;
  ${mediaQuery.md`
    margin-right: 16px;
  `}
`;
export const HamburgerButtonReskin = styled(KiwiIconButton)`
  margin-right: var(--kiwi-spacing-1);
  ${mediaQuery.md`
    margin-right: var(--kiwi-spacing-2);
  `}
`;
export const LuminLogo = styled.img`
  width: 104px;
  ${mediaQuery.md`
    width: 118px;
  `}
`;
export const Right = styled.div`
  & > .NotificationPanel {
    margin: 0;
  }
  min-width: 0;
  display: grid;
  grid-auto-rows: min-content;
  grid-auto-flow: column;
  column-gap: 16px;
  ${({ $isDisabled }) =>
    $isDisabled &&
    css`
      pointer-events: none;
      opacity: 0.5;
    `}
`;
export const RightReskin = styled.div`
  & > .NotificationPanel {
    margin: 0;
  }
  min-width: 0;
  display: grid;
  grid-auto-rows: min-content;
  grid-auto-flow: column;
  column-gap: var(--kiwi-spacing-1-5);
  align-items: center;
  ${({ $isDisabled }) =>
    $isDisabled &&
    css`
      pointer-events: none;
      opacity: 0.5;
    `}
`;
export const ButtonUpgrade = styled(ButtonMaterial)`
  background-color: transparent;
  color: var(--color-secondary-50);
  font-size: 14px;
  font-weight: 600;
  width: fit-content;
  padding: 0;
  height: auto;

  &:hover {
    background-color: transparent;
    color: var(--color-secondary-50);
  }
`;
export const UpgradeButtonLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  background-color: transparent;
  color: var(--color-secondary-50);

  &:visited {
    color: inherit;
  }
`;
export const LinkItem = styled.a`
  ${(props) =>
    props.$isNewLayout
      ? css`
          color: ${props.theme.le_main_on_surface};
          ${typographies.le_title_small}
        `
      : css`
          color: ${Colors.NEUTRAL_80};
          font-weight: 400;
        `}
`;
const notificationButtonStyle = css`
  width: ${(props) => (props.$isViewer ? '28px' : '32px')};
  height: ${(props) => (props.$isViewer ? '28px' : '32px')};
  min-width: auto;
  padding: 0;

  &:hover {
    background-color: ${getButtonHoverBackground};
  }

  && {
    ${(props) =>
      props.disabled &&
      `
      opacity: 0.5;
      background-color: transparent;
    `}
  }
`;
export const IconButton = styled(BaseIconButton)`
  ${notificationButtonStyle}
  ${(props) =>
    props.disabled &&
    `
    && {
      pointer-events: auto;
      cursor: not-allowed;

      &:hover {
        background-color: transparent;
      }
    }
  `}
  ${(props) =>
    props.$isNewLayoutButton &&
    `
    && {
      width: 32px;
      height: 32px;
      padding: 4px;
    }
  `}
`;
export const HelpCenterButton = styled(PopperButton)`
  ${notificationButtonStyle}
  border-radius: 50%;
`;

export const HelpCenterButtonReskin = styled(PopperButton)`
  && {
    ${(props) =>
      props.disabled &&
      `
      opacity: 0.5;
      background-color: transparent;
    `}
  }
`;

export const OfflineText = styled.span`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.SECONDARY_50};
  margin-left: 10px;
`;

export const ContainerReskin = styled.div`
  padding: var(--kiwi-spacing-2) var(--kiwi-spacing-2-5) var(--kiwi-spacing-2) var(--kiwi-spacing-1);
  position: sticky;
  left: 0;
  right: 0;
  top: 0;
  z-index: 110;
  background-color: var(--kiwi-colors-surface-surface-container-lowest);
  box-sizing: border-box;
  border-bottom: var(--border-secondary);
  height: 72px;
  ${mediaQuery.md`
    padding-left: var(--kiwi-spacing-2);
  `}
  ${mediaQuery.xl`
    width: 100%;
    padding: var(--kiwi-spacing-1-5) var(--kiwi-spacing-2);
    border-bottom: none;
    height: auto;
  `}
`;
export const Group = styled.div`
  min-width: 0;
  display: grid;
  grid-auto-rows: min-content;
  grid-auto-flow: column;
  align-items: center;
  column-gap: var(--kiwi-spacing-0-5);
`;
export const SearchViewContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  z-index: 120;
  gap: var(--kiwi-spacing-1-5);
  background-color: var(--kiwi-colors-surface-surface-container-lowest);
  padding: var(--kiwi-spacing-2) var(--kiwi-spacing-2-5) var(--kiwi-spacing-2) var(--kiwi-spacing-1);
`;

export const LuminLogoReskin = styled.img`
  width: 88px;
  height: 24px;
`;

export const LuminLogoWrapper = styled(Link)`
  display: flex;
  align-items: center;
  width: fit-content;
`;
