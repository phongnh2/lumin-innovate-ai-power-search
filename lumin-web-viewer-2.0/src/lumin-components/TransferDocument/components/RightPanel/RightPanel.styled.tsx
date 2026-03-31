import { IconButton, Text } from 'lumin-ui/kiwi-ui';
import styled from 'styled-components';

import MaterialAvatar from 'lumin-components/MaterialAvatar';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors } from 'constants/styles';

import { ItemReskin } from '../LeftSideBar/LeftSideBar.styled';

interface ItemProps {
  $isActive?: boolean;
  $isSubItem?: boolean;
  $isPersonalTargetSelected?: boolean;
  $isDisabled?: boolean;
}

interface ArrowProps {
  $isExpanded: boolean;
  $hasFolder: boolean;
}

interface FolderProps {
  $isSubItem?: boolean;
}

export const RightSideBarContainer = styled.div`
  flex: 1;
  max-height: 100%;
  ${mediaQuery.md`
    background-color: ${Colors.NEUTRAL_10};
    border: solid 1px ${Colors.NEUTRAL_20};
    border-radius: var(--border-radius-primary);
    margin-left: 6px;
  `}
`;

export const RightSideBarContainerReskin = styled.div`
  flex: 1;
  max-height: 100%;
  border-radius: 0 var(--kiwi-border-radius-md) var(--kiwi-border-radius-md) 0;
  border: var(--kiwi-spacing-0-125) solid var(--kiwi-colors-surface-surface-container-high);
  background: var(--kiwi-colors-surface-surface-container-lowest);
  padding: var(--kiwi-spacing-1-5);
  overflow: auto;
  &[data-full-width='true'] {
    border-radius: var(--kiwi-border-radius-md);
  }
`;

export const RightSideBarItemReskin = styled(ItemReskin)`
  &[data-activated='true'] {
    &::before {
      content: '';
      position: absolute;
      left: 0;
      width: var(--kiwi-spacing-0-25);
      height: 28px;
      background-color: var(--kiwi-colors-core-secondary);
      border-radius: 0 var(--kiwi-border-radius-xs) var(--kiwi-border-radius-xs) 0;
    }
  }
`;

export const RightSideBar = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  ${mediaQuery.md`
    padding: 16px;
  `}
`;

export const RightSideBarItemContainer = styled.div`
  background-color: ${Colors.NEUTRAL_0};
  height: 100%;
  border-radius: var(--border-radius-primary);
  overflow-y: auto;
  ${mediaQuery.md`
    padding-top: 8px;
  `}
`;

export const RightSideBarItemWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--kiwi-spacing-0-5);
`;

export const ItemName = styled.p`
  margin-left: 12px;
  font-size: 12px;
  font-weight: 375;
  line-height: 16px;
  font-style: normal;
  color: ${Colors.NEUTRAL_100};
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  word-break: break-all;
  max-width: 100%;
`;

export const RightSideBarItem = styled.li<ItemProps>`
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  ${({ $isActive, $isDisabled }) => $isActive && !$isDisabled ? `
    background-color: ${Colors.PRIMARY_20};
    &::before{
      content: '';
      width: 2px;
      height: 42px;
      position: absolute;
      background-color: ${Colors.PRIMARY_90};
    }
  `: `
    &:hover {
      background-color: ${Colors.PRIMARY_20};
    }
  `}
  ${({ $isPersonalTargetSelected }) => $isPersonalTargetSelected && `
    i {
      margin: 7px 0 7px 20px;
    }
  `}
  box-sizing: border-box;
  padding: 8px 24px 8px 0px;
  ${({ $isSubItem }) => $isSubItem && `padding: 14px 24px 14px 0;`}
  ${({ $isDisabled }) => $isDisabled && `
    ${ItemName} {
      opacity: 0.5;
    }
    .icon {
      opacity: 0.5;
    }
    .icon.icon-dropdown {
      opacity: 1;
    }
    &:hover {
      background-color: unset;
    }
  `};
`;

export const FolderItemContainer = styled.ul`
  transition: all 0.3s ease-out;
  transform-origin: center center;
  transition: height .5s;
`;

export const FolderItemContainerReskin = styled.ul`
  transition: all 0.3s ease-out;
  transform-origin: center center;
  transition: height .5s;
  display: flex;
  flex-direction: column;
  gap: var(--kiwi-spacing-0-5);
  &[data-sub-item='true'] {
    margin-top: var(--kiwi-spacing-0-5);
  }
`;

export const Title = styled.h3`
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  padding: 12px 0 0 16px;
  margin-bottom: 8px;
  ${mediaQuery.md`
    font-weight: 375;
    padding: 0;
  `}
`;

export const SubTitle = styled.h4`
  font-size: 10px;
  font-weight: 375;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
  margin: 12px 0 8px 18px;
  text-transform: uppercase;
`;

export const SubTitleReskin = styled(Text)`
  padding: var(--kiwi-spacing-1-5) 0;
  color: var(--kiwi-colors-surface-on-surface-variant);
`;

export const Avatar = styled(MaterialAvatar)``;

export const ArrowButton = styled(IconButton)`
  z-index: 2;
  min-width: var(--kiwi-spacing-3);
  i {
    transition: var(--default-web-transition);
  }
  &[data-expanded='true'] {
    i {
      transform: rotate(90deg);
    }
  }
`;

export const ArrowContainer = styled.div<ArrowProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  text-align: center;
  flex-grow: 0;
  margin-left: 8px;
  margin-right: 8px;
  color: ${Colors.NEUTRAL_80};
  transform: rotate(-90deg);
  border-radius: 4px;
  ${({ $hasFolder }) =>
    $hasFolder &&
    `
    &:hover {
      background-color: ${Colors.PRIMARY_30};
    }
  `}

  i {
    transition: all 0.3s ease-out;
    transform-origin: center center;
    ${({ $isExpanded }) => ($isExpanded
    ? `
      transform: rotate(90deg);
    `
    : '')};
  }
`;

export const FolderSection = styled.div<FolderProps>`
  display: flex;
  padding-left: 65px;
  padding-right: 24px;
  width: 100%;
  align-items: center;
  ${({ $isSubItem }) => !$isSubItem && `padding: 7px 0 7px 20px;`}
`;

export const HiddenArrow = styled.div`
  width: 28px;
  height: 10px;
`;
