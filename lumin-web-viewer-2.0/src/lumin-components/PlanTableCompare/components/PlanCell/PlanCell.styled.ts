import styled from 'styled-components';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const getBorder = () => `1px solid ${Colors.NEUTRAL_30}`;

export const Col = styled.span`
  border-left: ${getBorder};
`;

export const FeatureValueCol = styled(Col)<{ $empty: boolean }>`
  ${(props) => props.$empty && `
    background-color: ${Colors.NEUTRAL_5};
  `}
  border-bottom: ${getBorder};
`;

export const BoldPrice = styled.strong<{ $bold: boolean }>`
  font-weight: ${({ $bold }) => ($bold ? 600 : 375)};
`;

export const Cell = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-decoration: none;
  font-size: 10px;
  line-height: 12px;
  font-weight: 375;
  color: ${Colors.NEUTRAL_100};
  height: 100%;

  ${mediaQuery.xl`
    font-size: 12px;
    line-height: 16px;
    height: 48px;
  `}
`;
