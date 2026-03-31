import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${({ isSmallTab }) => (isSmallTab ? '0 auto ' : '32px auto')};
  ${mediaQuery.md`
    margin-top: ${({ isSmallTab }) => (!isSmallTab && '56px')};
  `}
  ${mediaQuery.xl`
    margin-top: ${({ isSmallTab }) => (!isSmallTab && '72px')};
  `}
`;

export const Image = styled.img`
  display: block;
  width: ${({ isSmallTab }) => (isSmallTab ? '80px' : '150px')};
  margin-bottom: 16px;
  ${mediaQuery.md`
    margin-bottom: 24px;
  `}
`;

export const Title = styled.span`
  font-weight: 600;
  font-size: ${({ isSmallTab }) => (isSmallTab ? '14px' : '17px')};
  line-height: ${({ isSmallTab }) => (isSmallTab ? '20px' : '24px')};
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 8px;
  ${mediaQuery.md`
    font-size: ${({ isSmallTab }) => (isSmallTab ? '17px' : '24px')};
    line-height: ${({ isSmallTab }) => (isSmallTab ? '24px' : '32px')};
  `}
`;

export const Content = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  ${({ isSmallTab }) => (!isSmallTab && mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `)}
`;
