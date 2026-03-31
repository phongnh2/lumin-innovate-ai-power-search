import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { Colors as ColorConstant } from 'constants/lumin-common';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Title = styled.h4`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 16px;

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
`;

export const Note = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  margin: 12px 0 0;

  b {
    font-weight: 600;
  }

  span {
    display: block;
  }

  ${mediaQuery.md`
    display: grid;
    grid-template-columns: 1fr min-content;
    column-gap: 16px;
    font-size: 14px;
    line-height: 20px;
    margin-top: 16px;
  `}
`;

export const SeeFullInvoices = styled.a`
  color: ${ColorConstant.ROYALBLUE};
  text-decoration: underline;
  cursor: pointer;
  display: inline-block;
  margin-top: 8px;
  white-space: nowrap;
  ${mediaQuery.md`
    margin-top: 0;
  `}
`;
