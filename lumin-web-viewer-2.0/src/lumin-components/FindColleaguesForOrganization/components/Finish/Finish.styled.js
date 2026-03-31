import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div``;

export const Title = styled.h1`
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
  `}
`;

export const Description = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin-top: 16px;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    margin-top: 24px;
  `}

  b {
    font-weight: 600;
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  align-items: center;

  ${mediaQuery.md`
    flex-direction: row;
    margin-top: 24px;
  `}
`;

export const Button = styled(ButtonMaterial)`
  width: 100%;
`;

export const ImgWrapper = styled.div`
  width: 100%;
  margin-top: 32px;

  ${mediaQuery.md`
    max-width: 640px;
  `}
`;

export const Img = styled.img`
  width: 100%;
`;
