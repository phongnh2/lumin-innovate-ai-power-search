import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  width: 100%;
  ${mediaQuery.md`
    width: 400px;
  `}
`;
