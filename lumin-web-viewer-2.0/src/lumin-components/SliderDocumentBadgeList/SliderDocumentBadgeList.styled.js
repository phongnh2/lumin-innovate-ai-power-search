import styled from 'styled-components';
import ButtonBase from '@mui/material/ButtonBase';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Wrapper = styled.div`
  position: relative;
`;

export const Container = styled.div`
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  overscroll-behavior: none;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ItemContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export const Item = styled.div`
  &:not(:last-child) {
    padding-right: 8px;
  }
`;

const Arrow = styled(ButtonBase)`
  display: block;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 4px;
  pointer-events: auto;
  transition: all 0.3s ease;
  &:hover {
    background: ${Colors.SOLITUDE};
  }
`;

const ArrowWrapper = styled.div`
  position: absolute;
  top: -1px;
  width: 64px;
  height: calc(100% + 2px);
  z-index: 3;
  align-items: center;
  pointer-events: none;
  visibility: ${({ isShow }) => (isShow ? 'visible' : 'hidden')};
  opacity: ${({ isShow }) => (isShow ? 1 : 0)};
  transition: all 0.3s ease;
  display: none;
  ${mediaQuery.md`
    display: flex;
  `}
`;

export const ArrowNextWrapper = styled(ArrowWrapper)`
  right: -1px;
  background: linear-gradient(to left, ${Colors.ALICEBLUE} 50%, transparent 100%);
  justify-content: flex-end;
`;

export const ArrowNext = styled(Arrow)``;

export const ArrowPrevWrapper = styled(ArrowWrapper)`
  left: -1px;
  background: linear-gradient(to right, ${Colors.ALICEBLUE} 50%, transparent 100%);
  justify-content: flex-start;
`;

export const ArrowPrev = styled(Arrow)``;
