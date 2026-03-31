import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { MAX_WIDTH_CONTAINER } from 'constants/lumin-common';

export const StyledOrganizationPlanContainer = styled.div`
  padding-top: 0;
`;

export const StyledOrganizationPlanTitle = styled.h1`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 800;
  font-size: 20px;
  line-height: 28px;
  color: ${Colors.NEUTRAL_100};
  text-align: center;

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
  `}

  ${mediaQuery.xl`
    font-size: 40px;
    line-height: 60px;
  `}
`;

export const StyledOrganizationPlanSubTitle = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  text-align: center;
  margin: 8px 0 8px;

  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
    margin: 12px 0 16px;
  `}

  ${mediaQuery.xl`
    margin-bottom: 9px;
  `}
`;

export const PlanBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;

  ${mediaQuery.md`
    padding: 0 48px;
    margin: 0 auto;
  `}

  ${mediaQuery.xl`
    flex-direction: row;
    padding: 0 18px;
    max-width: ${MAX_WIDTH_CONTAINER}px;
  `}
`;
