import styled from 'styled-components';

import { stretchChildren, stretchParent } from 'utils/styled';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  padding: ${({ $fullWidth }) => ($fullWidth ? '0px' : '16px')};
  ${stretchChildren}
  ${stretchParent}
  min-height: 100%;
  box-sizing: border-box;
  ${mediaQuery.md`
    padding: ${({ $fullWidth }) => ($fullWidth ? '0px' : '24px')};
  `}
  ${mediaQuery.xl`
    padding: 0;
  `}
`;

export const ContainerReskin = styled.div`
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  padding: ${({ $fullWidth }) => ($fullWidth ? '0px' : 'var(--kiwi-spacing-3)')};
  ${mediaQuery.xl`
    padding: 0;
  `}
`;
