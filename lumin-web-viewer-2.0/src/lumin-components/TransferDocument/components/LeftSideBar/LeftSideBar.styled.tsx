import { Text } from 'lumin-ui/kiwi-ui';
import styled from 'styled-components';

import MaterialAvatar from 'lumin-components/MaterialAvatar';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors } from 'constants/styles';

interface ItemProps {
  $isActive: boolean;
}

export const LeftSideBarContainer = styled.div`
  width: 100%;
  flex-direction: column;
  max-height: 100%;
  overflow-y: auto;
  display: flex;
  ${mediaQuery.md`
    width: 35%;
    background-color: ${Colors.PRIMARY_10};
    border: solid 1px ${Colors.PRIMARY_30};
    border-radius: var(--border-radius-primary);
    
  `}
`;

export const LeftSideBarContainerReskin = styled.div`
  flex-direction: column;
  max-height: 100%;
  overflow-y: auto;
  display: flex;
  width: 240px;
  background-color: var(--kiwi-colors-surface-surface-container-lowest);
  border: var(--kiwi-spacing-0-125) solid var(--kiwi-colors-surface-surface-container-high);
  border-right: none;
  border-radius: var(--kiwi-border-radius-md) 0 0 var(--kiwi-border-radius-md);
  padding: var(--kiwi-spacing-1-5);
`;

export const ItemName = styled.p`
  margin-left: 8px;
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
`;

export const ItemNameReskin = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  word-break: break-all;
`;

export const LeftSideBarWrapper = styled.div`
  flex: 1;
`;

export const LeftSideBarWrapperReskin = styled.div`
  display: grid;
  gap: var(--kiwi-spacing-0-5);
`;

export const LeftSideBarItem = styled.div<ItemProps>`
  display: grid;
  padding: 10px 16px;
  align-items: center;
  cursor: pointer;
  grid-template-columns: min-content minmax(0, 1fr) 24px;
  ${mediaQuery.md`
    grid-template-columns: min-content minmax(0, 1fr);
  `}
  ${({ $isActive }) => $isActive ? `
    background-color: ${Colors.PRIMARY_80};
    ${ItemName} {
      color: ${Colors.NEUTRAL_0};
    }
  ` : `
    &:hover {
      background-color: ${Colors.PRIMARY_20};
    }
  `};
`;

export const PersonalSection = styled.div<ItemProps>`
  display: grid;
  align-items: center;
  cursor: pointer;
  padding: 14px 16px;
  grid-template-columns: min-content minmax(0, 1fr) 24px;
  ${mediaQuery.md`
    grid-template-columns: min-content minmax(0, 1fr);
  `}
  ${({ $isActive }) => $isActive ? `
    background-color: ${Colors.PRIMARY_80};
    ${ItemName} {
      color: ${Colors.NEUTRAL_0};
    }
    .icon {
      color: ${Colors.NEUTRAL_0};
    }
  ` : `
    &:hover {
      background-color: ${Colors.PRIMARY_20};
    }
    .icon {
      color: ${Colors.NEUTRAL_100};
    }
  `};
`;

export const ItemReskin = styled.div`
  width: 197px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: var(--kiwi-spacing-1) var(--kiwi-spacing-1-5);
  border-radius: var(--kiwi-border-radius-md);
  position: relative;
  gap: var(--kiwi-spacing-1);
  &::after {
    transition: var(--default-web-transition);
    z-index: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    content: '';
    background-color: var(--kiwi-colors-surface-on-surface);
    border-radius: inherit;
    opacity: var(--kiwi-opacity-state-layer-none);
  }
  &:hover::after {
    opacity: var(--kiwi-opacity-state-layer-hovered);
  }
  &:active::after {
    opacity: var(--kiwi-opacity-state-layer-pressed);
  }
  &[data-activated='true'] {
    background-color: var(--kiwi-colors-custom-role-web-surface-blue);
    &::after {
      background-color: transparent;
    }
  }
  &[data-disabled='true'] {
    opacity: var(--kiwi-opacity-disabled-on-container);
    cursor: not-allowed;
  }
`;

export const PersonalSectionReskin = styled(ItemReskin)`
  margin-bottom: var(--kiwi-spacing-1-5);
`;

export const TitleReskin = styled(Text)`
  padding-bottom: var(--kiwi-spacing-1-5);
  color: var(--kiwi-colors-surface-on-surface-variant);
`;

export const NextArrow = styled.div`
  width: 24px;
  justify-content: center;
  align-items: center;
  display: flex;
`;

export const Title = styled.p`
  padding: 8px 8px 8px 16px;
  font-size: 10px;
  font-weight: 375;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
  margin-bottom: 4px;
  margin-top: 8px;
  text-transform: uppercase;
`;

export const Avatar = styled(MaterialAvatar)``;