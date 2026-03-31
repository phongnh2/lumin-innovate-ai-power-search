import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledInsightsContainer = styled.div`
`;

export const StyledWelcome = styled.div`
  margin-bottom: 16px;
`;

export const StyledInsightsLayout = styled.div`
  display: grid;
  grid-template-areas:
    'grid-member'
    'grid-right'
    'grid-plan';
  grid-template-columns: 100%;
  row-gap: 16px;
  
  ${mediaQuery.xl`
    grid-template-areas:
      'grid-member grid-right'
      'grid-plan grid-right';
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto 1fr;
    row-gap: 16px;
    column-gap: 32px;
  `}
`;

export const StyledInsightsMembers = styled.div`
  display: flex;
  align-items: stretch;
  grid-area: grid-member;
`;

export const StyledInsightsPlan = styled.div`
  display: block;
  ${mediaQuery.xl`
    display: none;
  `}
`;
export const StyledInsightsPlanDesktop = styled.div`
  display: none;
  ${mediaQuery.xl`
    display: block;
  `}
`;

export const StyledInsightsRight = styled.div`
  grid-area: grid-right;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto;
  column-gap: 16px;
  row-gap: 16px;
  ${mediaQuery.xl`
    grid-template-columns: auto;
    grid-template-rows: min-content min-content min-content;
  `}
`;

export const StyledMembersContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  margin-bottom: 25px;
`;

export const StyledMembersLeft = styled.div`
`;

export const StyledMembersRight = styled.div`
  margin-left: 36px;
`;

export const StyledViewMembersLink = styled(Link)`
  font-weight: 600;
  color: ${Colors.SECONDARY_50};
  font-size: 14px;
  line-height: 20px;
`;

export const StyledRecentlyAddedHeader = styled.div`
  border-radius: 8px 8px 0 0;
  display: flex;
  padding: 14px 24px;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${Colors.NEUTRAL_30};
`;

export const StyledAddedText = styled.h4`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;
export const RecentlyContainer = styled.div`
  background-color: ${Colors.WHITE};
  border-radius: 8px;
`;

export const StyledLastUpdateOnTab = styled.span`
  display: inline-block;
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
`;
