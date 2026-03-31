import styled from 'styled-components';

import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div``;

export const Table = styled.div`
  overflow-x: auto;

  ${mediaQuery.sm`
    overflow-x: unset;
  `}
`;
