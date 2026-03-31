import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 24px;
  ${mediaQuery.md`
    max-width: 632px;
    margin: 0 auto;
  `}
  ${mediaQuery.xl`
    max-width: none;
    width: auto;
    grid-template-columns: 632px 480px;
    justify-content: center;
  `}
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
`;
