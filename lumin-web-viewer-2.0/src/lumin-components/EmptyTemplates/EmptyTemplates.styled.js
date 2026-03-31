import { Colors } from 'constants/styles';
import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  margin: 20px auto 0;
  width: 288px;
  height: 288px;
  ${mediaQuery.md`
    margin-top: 16px;
    width: 440px;
    height: 440px;
  `}
  ${mediaQuery.xl`
    margin-top: 72px;
  `}
`;
export const Circle = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: ${Colors.NEUTRAL_10};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  ${mediaQuery.xl`
    background-color: ${Colors.PRIMARY_10};
  `}
`;
export const Img = styled.img`
  width: 96px;
  margin-bottom: 16px;
  ${mediaQuery.md`
    width: 138px;
    margin-bottom: 24px;
  `}
  ${mediaQuery.xl`
    width: 142px;
    margin-bottom: 32px;
  `}
`;
export const Title = styled.p`
  color: ${Colors.NEUTRAL_100};
  font-size: 17px;
  line-height: 24px;
  font-weight: 600;
  margin-bottom: 4px;
  ${mediaQuery.md`
    font-size: 24px;
    line-height: 32px;
    margin-bottom: 8px;
  `}
`;
export const Text = styled.p`
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;
