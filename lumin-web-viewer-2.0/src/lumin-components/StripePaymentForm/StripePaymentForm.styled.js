import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const CurrencyContainer = styled.div`
  margin: 16px 0;
`;
export const GridCols = styled.div`
  ${mediaQuery.md`
    display: grid;
    grid-template-columns: repeat(${(props) => props.$nCol || 2}, minmax(0, 1fr));
    column-gap: 16px;
    margin-bottom: 16px;
    ${CurrencyContainer} {
      margin: 0;
    }
  `}
`;
