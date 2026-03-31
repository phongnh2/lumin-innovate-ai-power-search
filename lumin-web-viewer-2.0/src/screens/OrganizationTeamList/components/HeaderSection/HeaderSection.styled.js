import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div``;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const Title = styled.h2`
  color: ${Colors.NEUTRAL_100};
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  margin-right: 16px;
  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
  ${mediaQuery.xl`
    font-size: 24px;
    line-height: 32px;
  `}
`;
