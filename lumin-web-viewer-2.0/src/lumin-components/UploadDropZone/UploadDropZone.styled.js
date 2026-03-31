import styled from 'styled-components';

import { Colors } from 'constants/styles';
import { stretchChildren, stretchParent } from 'utils/styled';

export const Container = styled.div`
  position: relative;
  box-sizing: border-box;
  ${stretchChildren}
  ${stretchParent}
  outline: none;
`;
export const ContainerReskin = styled.div`
  position: relative;
  box-sizing: border-box;
  outline: none;
  height: 100%;
`;

export const PopperContainer = styled.div`
  width: 240px;
`;

export const PopperItem = styled.div`
  padding: 0 ${(props) => (props.$disablePadding ? 0 : '16px')};
  height: 40px;
  transition: 0.3s all ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover {
    background: ${Colors.NEUTRAL_10};
  }
  div {
    display: flex;
    align-items: center;
    padding: 0 16px;
    width: 100%;
  }
  ${({ $isDisabled }) =>
    $isDisabled &&
    `
      opacity: 0.5;
      pointer-events: none;
  `}
`;
export const PopperText = styled.span`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: 0.34px;
  color: ${Colors.PRIMARY};
`;
export const PopperIcon = styled.img`
  margin-right: 8px;
  width: auto;
  height: 24px;
`;

export const MenuItemContainer = styled.div`
  ${({ $isDisabled }) =>
    $isDisabled &&
    `
      pointer-events: none;
  `}
`;

export const IconWrapper = styled.span`
  margin-right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const LeftLogoWrapper = styled.div`
  height: var(--kiwi-spacing-3);
  width: var(--kiwi-spacing-3);
  display: flex;
  align-items: center;
  justify-content: center;
`;
