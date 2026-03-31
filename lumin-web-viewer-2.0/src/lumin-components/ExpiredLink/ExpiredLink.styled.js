import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  box-sizing: border-box;
  margin-top: 60px;
  ${mediaQuery.xl`
    margin-top: 86px;
  `}
`;

export const Img = styled.img`
  width: 100%;
  max-width: 526px;
  margin: 0 auto;
`;

export const Title = styled.h1`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
  margin-top: 16px;
`;

export const SubTitle = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
  color: ${Colors.NEUTRAL_80};
  margin-top: 12px;
`;

export const Button = styled(ButtonMaterial)`
  width: 200px;
  margin-top: 24px;
`;
