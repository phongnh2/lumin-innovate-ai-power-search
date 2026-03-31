import styled from 'styled-components';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Divider = styled.div`
  display: flex;
  align-items: center;
  height: 16px;
  z-index: 2;
  position: relative;
  ${mediaQuery.md`
    height: 32px;
  `}
`;
export const HorizontalBarContainer = styled.div`
  background-color: ${Colors.WHITE};
  height: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
`;
export const HorizontalBar = styled.hr`
  height: 0;
  display: block;
  border: none;
  outline: 0;
  border-top: 1px ${Colors.NEUTRAL_20} dashed;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  margin: 0;
  transform: translateX(-50%);
  width: calc(100% - 16px);
  ${mediaQuery.md`
    width: calc(100% - 32px);
  `}
`;
export const VacantCircle = styled.img`
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 3px 7px rgba(128,147,167,0.5));
  user-select: none;
`;
export const VacantCircleWrapper = styled.div`
  width: 8px;
  height: 16px;
  position: relative;

  &:before, &:after {
    content: "";
    display: block;
    position: absolute;
    ${(props) => (props.$right ? `
      right: 0;
    ` : `
      left: 0;
    `)}
    width: calc(100% + 8px);
    height: 8px;
    background-color: ${Colors.WHITE};
    z-index: 1;
  }

  &:before {
    top: -8px;
  }
  &:after {
    bottom: -8px;
  }

  ${mediaQuery.md`
    width: 16px;
    height: 32px;
  `}
`;
