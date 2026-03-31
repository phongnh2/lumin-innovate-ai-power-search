import React from 'react';

import Skeleton from 'luminComponents/Shared/Skeleton';

import PieChartLegendSkeleton from './PieChartLegendSkeleton';

import { StyledContainer, StyledChart, StyledLegendContainer } from './PieChart.styled';

function DocumentsPieChartSkeleton() {
  return (
    <StyledContainer>
      <StyledChart>
        <Skeleton variant="circular" width="100%" height="100%" />
      </StyledChart>
      <StyledLegendContainer $loading>
        <ul>
          <PieChartLegendSkeleton />
          <PieChartLegendSkeleton />
        </ul>
      </StyledLegendContainer>
    </StyledContainer>
  );
}

export default DocumentsPieChartSkeleton;
