import React from 'react';
import Skeleton from 'luminComponents/Shared/Skeleton';
import { StyledLegendItem, StyledLegendItemRow } from './PieChart.styled';

const PieChartLegendSkeleton = () => (
  <StyledLegendItem>
    <StyledLegendItemRow>
      <Skeleton type="rect" width={40} height={25} />
    </StyledLegendItemRow>
    <StyledLegendItemRow>
      <Skeleton type="rect" width={110} height={20} />
    </StyledLegendItemRow>
  </StyledLegendItem>
);

export default PieChartLegendSkeleton;
