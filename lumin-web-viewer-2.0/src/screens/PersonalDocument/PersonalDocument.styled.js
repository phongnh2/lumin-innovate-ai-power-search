import styled from 'styled-components';
import { stretchChildren, stretchParent } from 'utils/styled';

export const Container = styled.div`
  min-height: 100%;
  box-sizing: border-box;
  ${stretchParent}
  ${stretchChildren}
`;

export const ContainerReskin = styled.div`
  min-height: 100%;
  box-sizing: border-box;
  height: 100%;
`;
