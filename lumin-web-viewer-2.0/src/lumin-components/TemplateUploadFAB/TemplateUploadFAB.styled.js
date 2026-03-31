import styled from 'styled-components';
import MuiFab from '@mui/material/Fab';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 111;
  display: flex;
  flex-direction: column;
`;
export const Overlay = styled.div`
  background: rgb(27 42 60 / 70%);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 111;
  visibility: hidden;
  opacity: 0;
  transition: all 0.5s ease;
  will-change: visibility, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  height: 100%;

  ${(props) => props.$active && `
    visibility: visible;
    opacity: 1;
  `}
`;
const BaseFab = styled(MuiFab)`
  width: 64px;
  height: 64px;
  box-shadow: var(--shadow-m);
`;
export const RootFab = styled(BaseFab)`
  background-color: ${Colors.SECONDARY_50};
  .TemplateUploadFAB__plus {
    transition: transform 0.5s ease;
    ${(props) => props.$active && `
      transform: rotate(45deg);
    `}
    }
  &:hover {
    background-color: ${Colors.SECONDARY_60};
  }
`;
export const Fab = styled(BaseFab)`
  background-color: #fff;
  border: 1px solid ${Colors.NEUTRAL_10};
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s ease;
  transform: scale(0.3);

  ${(props) => props.$active && `
    opacity: 1;
    visibility: visible;
    transform: translate3d(0, -${props.$pos * (64 + 12)}px, 0) scale(1);
  `}
  &:hover {
    background-color: ${Colors.NEUTRAL_30};
  }
`;
