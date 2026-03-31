import styled from 'styled-components';
import { Link as LinkRouter } from 'react-router-dom';

import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${Colors.NEUTRAL_10};
`;

export const Container = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 24px 16px;

  ${mediaQuery.md`
    margin-top: 48px;
    padding: 0;
  `}

  ${mediaQuery.md`
    margin-top: 60px;
  `}
`;

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
  margin-top: 12px;
  text-align: center;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    margin-top: 24px;
    text-align: left;
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

  ${mediaQuery.md`
    max-width: 232px;
  `}
`;

export const Link = styled(LinkRouter)`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_70};
  margin-top: 16px;

  &:hover {
    text-decoration-line: underline;
  }

  ${mediaQuery.md`
    margin-top: 0;
    margin-left: 24px;
  `}
`;

export const Image = styled.img`
  width: 100%;
  height: 100%;
  margin-top: 36px;

  ${mediaQuery.xl`
    margin-top: 32px;
  `}
`;
