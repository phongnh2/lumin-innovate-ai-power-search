import { Fonts } from 'constants/styles';
import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  width: 100%;
  position: relative;
  transition: opacity 0.3s ease;
  min-height: 60px;
  ${mediaQuery.xl`
    min-height: 200px;
  `}
  &:before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    background-color: ${({ $loading }) => ($loading ? '#fff' : 'transparent')};
    transition: background-color 0.3s ease;
    pointer-events: ${({ $loading }) => ($loading ? 'auto' : 'none')};
  }
`;

export const ContainerReskin = styled.div`
  width: 100%;
  position: relative;
  transition: opacity 0.3s ease;
  font-family: ${Fonts.SECONDARY};

  &:before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    background-color: ${({ $loading }) => ($loading ? '#fff' : 'transparent')};
    transition: background-color 0.3s ease;
    pointer-events: ${({ $loading }) => ($loading ? 'auto' : 'none')};
  }

  .LuminInput__input {
    height: 40px;
  }
`;

export const Loading = styled.div`
  position: relative;
  z-index: 2;
`;
