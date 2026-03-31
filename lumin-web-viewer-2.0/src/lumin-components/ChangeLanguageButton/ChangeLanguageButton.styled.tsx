import { MenuList } from '@mui/material';
import styled from 'styled-components';

import BasePopperButton from 'lumin-components/PopperButton';
import BaseMenuItem from 'lumin-components/Shared/MenuItem';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors } from 'constants/styles';

type MenuItemProps = {
  $disabled: boolean;
  onClick: () => void;
  children: JSX.Element;
};

export const Wrapper = styled.div`
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: var(--border-secondary);
`;

export const Label = styled.h5`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 16px;

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
`;

export const Menu = styled(MenuList)`
  min-width: 256px;
  padding: 0;
`;

export const PopperButton = styled(BasePopperButton)`
  min-width: 256px;
  min-height: 48px;
  border: var(--border-primary);
  border-radius: var(--border-radius-primary);
  padding-left: 18px;
  padding-right: 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: none;

  &:hover {
    background-color: ${Colors.NEUTRAL_10};
  }
`;

export const MenuItem = styled(BaseMenuItem)<MenuItemProps>`
  padding-right: 20px;

  ${({ $disabled }) => $disabled && `
    pointer-events: none;
  `}
`;

export const Item = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const TextWrapper = styled.div`
  display: flex;
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
`;

export const SelectText = styled.p`
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-left: 8px;
`;

export const Image = styled.img`
  width: 20px;
  height: 20px;
`;

export const DropdownText = styled.p`
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
`;
