import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 24px 16px 16px;
  background-color: ${Colors.NEUTRAL_10};

  ${mediaQuery.md`
    padding-top: 48px;
  `}

  ${mediaQuery.xl`
    padding-top: 60px;
  `}
`;

export const Container = styled.div`
  width: 100%;
  max-width: 486px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
`;

export const Title = styled.h1`
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
    text-align: left;
  `}
`;

export const Description = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin: 12px 0 16px;
  text-align: center;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    margin: 24px 0;
    text-align: left;
  `}
`;

export const Img = styled.img`
  margin-top: 32px;
  width: 100%;
`;
