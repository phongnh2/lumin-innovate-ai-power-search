import MenuList from '@mui/material/MenuList';
import { PlainTooltip, Button as KiwiButton } from 'lumin-ui/kiwi-ui';
import React from 'react';
import styled, { css, keyframes } from 'styled-components';

import Avatar from 'lumin-components/GeneralLayout/general-components/Avatar';
import Divider from 'lumin-components/GeneralLayout/general-components/Divider';
import PopperButton from 'lumin-components/PopperButton';
import MenuItem from 'lumin-components/Shared/MenuItem';
import SvgElement from 'lumin-components/SvgElement';

import { mediaQueryDown } from 'utils/styles/mediaQuery';

import { typographies } from 'constants/styles/editor';

interface HelpCenterButtonProps {
  disabled?: boolean;
}

interface IconAutoSyncStatusProps {
  $hasRotateEffect?: boolean;
}

interface CollaboratorAvatarProps {
  $isInPopper?: boolean;
  $active?: boolean;
  index?: number;
  $isPopperButton?: boolean;
  $idle?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

interface SyncStatusProps {
  $disabled?: boolean;
}

const baseHoverStyle = css`
  ${({ theme }) =>
    `
    &:hover {
      background-color: ${theme.le_state_layer_on_surface_variant_hovered} !important;
      border-radius: var(--border-radius-primary);
    }
  `}
`;

const rotate = keyframes`to{ transform: rotate(360deg); }`;

const rotateAnimation = css`
  transform-origin: 50% 50%;
  animation: ${rotate} 1.5s linear infinite;
`;

export const ShareToolTip = styled(PlainTooltip)`
  overflow: visible;
`;

export const SharePopper = styled(PopperButton)`
  min-width: 76px;
  min-height: 32px;
`;

const notificationButtonStyle = css`
  width: 32px;
  height: 32px;
  min-width: auto;
  padding: 4px;
  && {
    ${(props: HelpCenterButtonProps) =>
      props.disabled &&
      `
      opacity: 0.5;
      background-color: transparent;
    `}
  }
  ${({ theme }) =>
    `
    color: ${theme.le_main_on_surface_variant};
  `}
`;

export const HelpCenterButton = styled(PopperButton)<HelpCenterButtonProps>`
  ${notificationButtonStyle}
  border-radius: 50%;
`;

export const GroupContainer = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;

  ${mediaQueryDown.sm`
    display: none;
  `}
`;

export const AutoSyncSwitchWrapper = styled.div`
  ${baseHoverStyle}
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  gap: 12px;
  padding: 0 8px;
`;

export const AutoSyncTitle = styled.span`
  display: flex;
  align-items: center;
  white-space: nowrap;
  ${{ ...typographies.le_label_large }};
  ${(props) =>
    `
      color: ${props.theme.le_main_on_surface};
    `}
  & .GoogleLogo {
    margin-right: 4px;
  }
  position: relative;
`;

export const IconAutoSyncStatus = styled(SvgElement)<IconAutoSyncStatusProps>`
  position: absolute;
  top: 12px;
  left: 12px;
  ${({ $hasRotateEffect }) =>
    $hasRotateEffect &&
    css`
      ${rotateAnimation}
    `}
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  gap: 12px;

  .Popper__styleContent {
    overflow: visible;
  }
`;

export const NotificationDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: 4px;
  right: 4px;
  position: absolute;
  background-color: var(--color-secondary-50);
  animation: notification-dot-anim 1s ease infinite alternate;
`;

export const DividerStyled = styled(Divider)`
  && {
    height: 16px;
    margin-right: 4px;
  }
`;

export const OriginalButton = styled(KiwiButton)`
  min-width: 150px;
`;

export const ListMenu = styled(MenuList)`
  box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 8px;
  ${({ theme }) => `
    background-color: ${theme.le_main_surface_container_low} !important;
  `}
`;

export const ListMenuItem = styled(MenuItem)<{ children?: React.ReactNode }>`
  min-height: 32px;
  min-width: 288px;
  ${{ ...typographies.le_body_medium }};
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
    &:hover {
      background-color: ${theme.le_state_layer_on_surface_hovered} !important;
      color: ${theme.le_main_on_surface} !important;
    }
  `}
  gap: 16px;
  border-radius: 4px;
  > i {
    width: 24px;
  }
`;

export const CollaboratorWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  justify-content: flex-end;
  & > * {
    transition: transform 0.3s linear;
  }
  &:hover > *:nth-child(2) {
    transform: translateX(-8px);
  }
  &:hover > *:nth-child(3) {
    transform: translateX(-16px);
  }
  & > *:nth-child(2).active {
    transform: translateX(-8px);
  }
  & > *:nth-child(3).active {
    transform: translateX(-16px);
  }
`;

export const CollaboratorAvatar = styled(Avatar)<CollaboratorAvatarProps>`
  ${{ ...typographies.le_label_small }};
  ${({ theme, $isInPopper }) => `
    color: ${theme.le_main_on_surface};
    background-color: ${theme.le_main_surface_container_highest} !important;
    &:hover {
      border: ${!$isInPopper ? `2px solid ${theme.le_main_primary}` : ''} !important;
      z-index: 100;
    }
  `}

  ${({ theme, $active }) =>
    $active &&
    `
    border: 2px solid ${theme.le_main_primary};
  `}

  ${({ index, $isInPopper }) =>
    !$isInPopper &&
    `
    transform: translateX(${index * 8}px);
  `}

  ${({ $isPopperButton }) =>
    $isPopperButton &&
    `
    transform: translateX(16px);
  `}

  ${({ $idle }) =>
    $idle &&
    `
    opacity: 0.5;
  `}
`;

export const PopoverWrapper = styled.div`
  width: 150px;
  min-height: 1px;
  background-color: transparent;
`;

export const SyncStatus = styled.span<SyncStatusProps>`
  ${{ ...typographies.le_label_large }};
  ${({ theme, $disabled }) => `
    color: ${$disabled ? theme.le_disable_on_container : theme.le_main_primary};
  `}
`;

export const ButtonWrapper = styled.div`
  position: relative;
`;
