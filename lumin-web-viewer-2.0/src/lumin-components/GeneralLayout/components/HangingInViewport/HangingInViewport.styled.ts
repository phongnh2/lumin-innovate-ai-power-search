import styled from 'styled-components';

export const Backdrop = styled.div`
  background: ${({ theme }) => theme.le_main_scrim};
  position: absolute;
  inset: 0;
  opacity: 0.3;
  z-index: 9901;
`;

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 9900;
  top: 0;
  left: 0;
`;

export const Content = styled.div`
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9902;
`;
