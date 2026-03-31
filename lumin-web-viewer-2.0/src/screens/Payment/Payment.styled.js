import { Colors, Fonts } from 'constants/styles';
import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  padding: 32px 16px;
  ${mediaQuery.md`
    padding: 48px 0;
  `}
  ${mediaQuery.xl`
    padding: 56px 0;
  `}
`;

export const Title = styled.h1`
  margin-bottom: 4px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: ${Colors.NEUTRAL_100};
  ${mediaQuery.md`
    font-size: 32px;
    line-height: 45px;
    margin-bottom: 0;
  `}
`;

export const TitleReskin = styled.h1`
  margin-bottom: 8px;
  text-align: center;
  font-family: ${Fonts.SIGN_PRIMARY};
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  color: ${Colors.LUMIN_SIGN_PRIMARY};
  ${mediaQuery.md`
    font-size: 28px;
    line-height: 130%;
  `}
`;

export const Description = styled.p`
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_80};
  text-align: center;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
    margin-bottom: 36px;
  `}
`;

export const DescriptionReskin = styled.p`
  margin-bottom: 16px;
  font-family: ${Fonts.SECONDARY};
  font-size: 14px;
  line-height: 140%;
  font-weight: 400;
  color: ${Colors.LUMIN_SIGN_PRIMARY};
  text-align: center;
  ${mediaQuery.md`
    margin-bottom: 24px;
  `}
`;
