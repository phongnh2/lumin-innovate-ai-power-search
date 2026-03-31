import styled from 'styled-components';
import ChipColor from 'luminComponents/Shared/ChipColor';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const StyledHeader = styled.div`
  margin-bottom: 17px;
  ${mediaQuery.md`
    margin-bottom: 32px;
  `}
`;

export const StyledTeamTitle = styled.h2`
  color: ${Colors.NEUTRAL_100};
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  margin: 4px 15px 0 0;
  ${mediaQuery.md`
    font-size: 20x;
    line-height: 28px;
  `}
`;

export const StyledTeamGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(328px, 1fr));
  gap: 16px;
  box-sizing: border-box;
  margin-top: 16px;
  padding-bottom: 80px;
  ${mediaQuery.md`
    grid-template-columns: repeat(auto-fill, minmax(248px, 1fr));
    gap: 24px;
    margin-top: 32px;
  `}
  ${mediaQuery.xl`
    gap: 16px;
    margin-top: 16px;
  `}
`;

export const StyledTeamGridItem = styled.div`
  box-sizing: border-box;
  width: 100%;
  flex-basis: 100%;
  flex-grow: 0;
`;

export const StyledTeamPlanTag = styled(ChipColor)`
  margin-left: 12px;
`;
