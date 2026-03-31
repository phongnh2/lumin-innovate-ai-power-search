import styled from 'styled-components';
import DashboardCard from 'luminComponents/DashboardCard';
import { styledPropConfigs } from 'utils/styled';

export const StyledChartContainer = styled.div`
  margin-top: ${({ $noChart }) => ($noChart ? '0' : '20px')};
  padding-right: 0;
`;
export const StyledCardContainer = styled(DashboardCard)`
  min-height: 280px;
  display: flex;
  flex-direction: column;
  ${({ noChart }) => (noChart ? `
    min-height: auto;
  ` : '')}
`;
export const StyledChart = styled.div.withConfig(styledPropConfigs(['noChart']))`
  width: 100%;
  height: ${({ noChart }) => (noChart ? 'auto' : '130px')};
`;
