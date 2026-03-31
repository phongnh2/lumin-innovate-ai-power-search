import styled from 'styled-components';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { baseRowStyles } from '../DetailPlanRow/DetailPlanRow.styled';

export const HeadCol = styled.span`
  border-left: 1px solid ${Colors.NEUTRAL_30};
  display: block;
  height: 100%;
  text-decoration: none;
`;

export const Wrapper = styled.div`
  height: 40px;

  ${mediaQuery.xl`
    height: 64px;
  `}
`;

export const Cell = styled.span<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-decoration: none;
  color: ${Colors.NEUTRAL_100};
  height: 100%;
  font-weight: 600;
  background-color: ${({ $color }) => $color};
  text-transform: capitalize;
  border-bottom: 1px solid ${Colors.NEUTRAL_30};
  font-size: 14px;
  line-height: 20px;

  ${mediaQuery.xl`
    font-size: 17px;
    line-height: 24px;
    height: 64px;
  `}
`;

export const HeadRow = styled.div`
  ${baseRowStyles}
  min-height: 40px;
  border: none;

  ${mediaQuery.md<{ $showPlanTable: boolean }>`
    ${({ $showPlanTable }) => $showPlanTable && `
      position: sticky;
      top: 0;
      z-index: 100;
    `}
  `}

  ${mediaQuery.xl`
    min-height: 64px;
  `}
`;
