import styled, { css } from 'styled-components';

import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const getBorder = () => `1px solid ${Colors.NEUTRAL_30}`;

export const BaseCell = styled.span`
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

export const baseRowStyles = css`
  display: grid;
  grid-template-columns: 188px repeat(5, minmax(96px, 1fr));
  min-height: 40px; 

  ${mediaQuery.xl`
    grid-template-columns: 274px repeat(5, minmax(0, 1fr));
  `}

`;

export const Row = styled.div`
  background-color: ${Colors.WHITE};
  ${baseRowStyles}
  &:nth-child(2) {
    ${BaseCell} {
      border-top: ${getBorder};
    }
  }
`;

export const Cell = styled(BaseCell)`
  justify-content: flex-start;
  text-align: left;
  padding-left: 12px;

  ${mediaQuery.xl`
    padding-left: 20px;
  `}
`;

export const Text = styled.span<{ $tooltip: boolean }>`
  cursor: pointer;
  ${(props) => props.$tooltip && `
    border-bottom: 0.5px dashed ${Colors.BLACK};
  `}
`;

export const Col = styled.span`
  justify-content: flex-start;
  border: none;
  border-bottom: ${getBorder};
`;
