import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  width: 100%;
  margin: 8px 0px 0px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  border-bottom: 1px solid ${({ theme }) => theme.divider || Colors.NEUTRAL_20};
  ${mediaQuery.md`
    height: 300px;
  `}
`;

export const NoResults = styled.p`
  margin: 0;
  padding-top: 40px;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.subTitle || Colors.NEUTRAL_80};
  text-align: center;
`;
