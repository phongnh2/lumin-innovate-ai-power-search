import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledTeamHeaderContainer = styled.div`
  margin-bottom: 24px;
  
  ${mediaQuery.md`
    margin-bottom: 16px;
  `}
  ${mediaQuery.xl`
    margin-bottom: 32px;
  `}
`;

export const StyledTeamLoading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 60px;
`;
