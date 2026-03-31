import styled from 'styled-components';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors } from 'constants/styles';

export const RightSideBarItemContainer = styled.div`
  background-color: ${Colors.NEUTRAL_0};
  height: 100%;
  border-radius: var(--border-radius-primary);
  overflow-y: auto;
  ${mediaQuery.md`
    padding-top: 8px;
  `}
  &[data-reskin='true'] {
    background-color: transparent;
  }
`;

export const RightSideBarItemWrapper = styled.ul`
  display: flex;
  flex-direction: column;
`;

export const RightSideBarItem = styled.li`
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  height: 44px;
  box-sizing: border-box;
  padding: 8px 24px 8px 0px;
`;

export const SubTitle = styled.h4`
  font-size: 10px;
  font-weight: 375;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
  margin: 12px 0 8px 18px;
  text-transform: uppercase;
`;

export const ArrowWrapper = styled.div`
  padding: 0 14px 0 16px;
`;

export const TextWrapper = styled.div`
  padding-left: 10px;
`;
