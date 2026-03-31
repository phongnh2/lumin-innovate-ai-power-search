import styled from 'styled-components';

import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';
import { baseRowStyles } from '../DetailPlanRow/DetailPlanRow.styled';

import * as PlanCell from '../PlanCell/PlanCell.styled';

export const Cell = styled(PlanCell.Cell)`
  font-size: 14px;
  line-height: 20px;
  justify-content: flex-start;
  text-align: left;
  border-bottom: none;
  padding-left: 12px;
  
  ${mediaQuery.xl`
    padding-left: 20px;
  `}
`;

export const Text = styled.span`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.PRIMARY_90};
`;

export const Col = styled(PlanCell.Col)`
  border: none;
`;

export const Row = styled.div`
  ${baseRowStyles}
  background-color: ${Colors.PRIMARY_30};
  &:nth-child(2) {
    ${PlanCell.Cell} {
      border-top: ${PlanCell.getBorder};
    }
  }
`;

export const ValueCell = styled.div`
  background-color: ${Colors.PRIMARY_30};
`;
