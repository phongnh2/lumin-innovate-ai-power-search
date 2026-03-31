import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.section`
  margin-top: 8px;
  margin-bottom: 54px;

  ${mediaQuery.md`
    margin-top: 0px;
  `}

  ${mediaQuery.xl`
    margin-top: 40px;
  `}
`;

export const TopSection = styled.div`
  display: flex;
  flex-direction: column;

  ${mediaQuery.md`
    flex-direction: row;
    justify-content: space-between;
  `}
`;

export const TitleMobile = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}

  ${mediaQuery.xl`
    display: none;
  `}
`;

export const Edit = styled.div`
  display: flex;
  margin-top: 16px;

  ${mediaQuery.md`
    margin-top: 0;
  `}
`;

export const PrimaryText = styled.span`
  font-weight: 600;
`;
