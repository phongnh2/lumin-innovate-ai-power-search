import styled from 'styled-components';
import { makeStyles } from '@mui/styles';

import { Colors } from 'constants/styles';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import ChipColor from 'luminComponents/Shared/ChipColor';
import { mediaQuery, mediaQueryDown } from 'utils/styles/mediaQuery';

export const StyledTopHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  ${mediaQuery.md`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  `}
`;

export const StyledTeamInfoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  width: 100%;
  overflow-x: hidden;
  ${mediaQuery.md`
    padding-right: 16px;
    margin-bottom: 0;
    flex: 1 1 auto;
  `}
`;

export const StyledTeamAvatar = styled(MaterialAvatar)``;

export const StyledTeamInfo = styled.div`
  margin-left: 12px;
  flex: 1;
  overflow: hidden;
`;

export const StyledTeamName = styled.h3`
  margin-bottom: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
`;

export const StyledTag = styled(ChipColor)`
  margin-right: 5px;
`;

export const StyledTagList = styled.div``;

export const StyledTeamTabsContainer = styled.div`
  width: 100%;
  flex-shrink: 0;
  ${mediaQuery.md`
    width: auto;
  `}
`;

export const StyledBreadcrumbContainer = styled.div`
  margin-bottom: 18px;
  ${mediaQueryDown.xl`
    display: ${(props) => props.$hideOnTablet && 'none'};
  `}
  ${mediaQuery.xl`
    display: ${(props) => props.$hideOnDesktop && 'none'};
  `}
`;
export const StyledBreadcrumbContainerReskin = styled.div`
  ${mediaQueryDown.xl`
    display: ${(props) => props.$hideOnTablet && 'none'};
  `}
  ${mediaQuery.xl`
    display: ${(props) => props.$hideOnDesktop && 'none'};
  `}
`;
export const useTabStyles = makeStyles({
  tab: {
    flex: 'auto',
    padding: '0 16px',
    color: Colors.NEUTRAL_60,
  },
  tabActive: {
    color: Colors.NEUTRAL_100,
  },
});
