import styled from 'styled-components';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors, Fonts } from 'constants/styles';

export const Wrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  max-width: 500px;
  margin: 32px auto auto;
  padding: 0 16px;
  ${mediaQuery.md`
    margin-top: 24px;
  `}
  ${mediaQuery.lg`
    max-width: 850px;
  `}
`;

export const Image = styled.img`
  width: 240px;
  ${mediaQuery.md`
    width: 420px;
  `}
`;

export const Title = styled.h1`
  margin-top: 24px;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
  ${mediaQuery.md`
    margin-top: 48px;
    font-size: 24px;
    line-height: 32px;
  `}
`;

export const Description = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: ${Colors.NEUTRAL_80};
  margin-top: 12px;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const MainButton = styled(ButtonMaterial)`
  margin-top: 18px;
  min-width: 200px;
`;
