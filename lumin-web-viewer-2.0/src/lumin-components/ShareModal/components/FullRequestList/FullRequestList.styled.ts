import styled from 'styled-components'

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  background-color: ${({ theme }) => theme.requestAccessList.fullListBackground};
`;

export const Header = styled.div`
  margin-bottom: 4px;
  padding: 16px 16px 0 16px;
  ${mediaQuery.md`
    padding: 24px 24px 0 24px;
  `}
`;