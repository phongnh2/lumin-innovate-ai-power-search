import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  box-sizing: border-box;
  ${mediaQuery.sm`
    padding: 0px;
  `}
`;

export const StyledImage = styled.img`
  width: 40px;
  height: 40px;

  ${mediaQuery.sm`
    width: 48px;
    height: 48px;
  `}
`;

export const StyledTitle = styled.h3`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};
  margin-top: 16px;
  text-align: center;
`;

export const StyledDescription = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  margin-top: 8px;
  text-align: center;
`;

export const StyledButtonWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;
