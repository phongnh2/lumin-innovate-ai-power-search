import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${({ $isFolder }) => ($isFolder ? '14px' : '24px')};
  ${mediaQuery.md`
    margin-top: 56px;
  `}
  ${mediaQuery.xl`
    margin-top: 72px;
  `}
`;

export const Image = styled.img`
  display: block;
  width: 240px;
  margin-bottom: 16px;
  ${mediaQuery.md`
    width: 304px;
    margin-bottom: 24px;
  `}
`;

export const Title = styled.div`
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 8px;
  ${mediaQuery.md`
    font-size: 24px;
    line-height: 32px;
  `}
`;

export const Content = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;
