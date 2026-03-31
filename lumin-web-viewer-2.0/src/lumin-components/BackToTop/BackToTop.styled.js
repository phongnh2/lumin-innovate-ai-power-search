import { animated } from 'react-spring';
import styled from 'styled-components';

import { styledPropConfigs } from 'utils/styled';
import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors } from 'constants/styles';

export const Text = styled.span`
  font-size: 14px;
  font-weight: 600;
  margin-left: 8px;
  display: inline-block;
  pointer-events: none;
`;

export const TextReskin = styled.span`
  color: var(--kiwi-colors-core-on-secondary);
  margin-left: var(--kiwi-spacing-1);
  display: inline-block;
  pointer-events: none;
`;

export const Container = styled(animated.div).withConfig(styledPropConfigs('stickAt'))`
  position: absolute;
  left: var(--kiwi-spacing-1);
  transform: translateX(-50%);
  z-index: 300;
  ${(props) =>
    props.$canShowButton
      ? `
    pointer-events: auto;
  `
      : `
    pointer-events: none;
  `}
  ${({ stickAt }) => (stickAt ? `top: ${stickAt}px;` : '')}
  ${mediaQuery.sm`
    height: 40px;
    bottom: -40px;
  `}
  ${mediaQuery.xl`
    width: 40px;
    transform: translateX(0);
    left: calc(100% - 56px);
  `}
`;

export const BadgeContainer = styled(animated.div)`
  height: 32px;
  padding: 0 14px;
  box-sizing: border-box;
  color: ${Colors.WHITE};
  background-color: ${Colors.PRIMARY};
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  ${mediaQuery.sm`
    height: 40px;
  `}

  ${mediaQuery.xl`
    height: 40px;
    width: 40px;
    border-radius: 4px;

    ${Text} {
      display: none;
    }
  `}
`;

export const BadgeContainerReskin = styled(animated.div)`
  height: var(--kiwi-spacing-4);
  padding: 0 var(--kiwi-spacing-1-75);
  box-sizing: border-box;
  color: var(--kiwi-colors-core-on-secondary);
  background-color: var(--kiwi-colors-core-secondary);
  border-radius: var(--kiwi-border-radius-rounded);
  box-shadow: var(--kiwi-shadow-2);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  ${mediaQuery.sm`
    height: var(--kiwi-spacing-5);
  `}

  ${mediaQuery.xl`
    height: var(--kiwi-spacing-5);
    width: var(--kiwi-spacing-5);
    border-radius: var(--kiwi-border-radius-md);

    ${TextReskin} {
      display: none;
    }
  `}
`;

export const ContainerReskin = styled(animated.div).withConfig(styledPropConfigs('stickAt'))`
  position: absolute;
  right: var(--kiwi-spacing-2);
  transform: translateX(-50%);
  z-index: 300;

  ${({ $activePanel }) => $activePanel && `right: calc(var(--kiwi-spacing-3) + var(--web-right-panel-width));`}
  ${(props) =>
    props.$canShowButton
      ? `
    pointer-events: auto;
  `
      : `
    pointer-events: none;
  `}
  ${({ stickAt }) => (stickAt ? `top: ${stickAt}px;` : '')}
  ${mediaQuery.sm`
    height: 40px;
    bottom: 0;
  `}
`;
