import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledDocumentInsightContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 90px;
  min-width: 150px;

  ${mediaQuery.xl`
    justify-content: space-between;
  `}
  ${mediaQuery.sm`
    flex-direction: row;
  `}
`;

export const StyledDocumentCountContainer = styled.div`
  width: 100%;
  ${mediaQuery.sm`
    min-width: 150px;
    width: auto;
    flex-shrink: 0;
  `}
`;

export const StyledDocumentChartContainer = styled.div`
  height: 120px;
  margin: 24px 0 12px;
  width: 100%;
  padding-left: 0;

  ${mediaQuery.md`
    margin-top: 0;
    padding-left: 60px;
  `}
  ${mediaQuery.xl`
    width: 100%;
  `}
`;

export const StyledActivitiesContainer = styled.div`
  margin-top: 16px;
  ${mediaQuery.xl`
    margin-top: 24px;
  `}
`;
