import styled from 'styled-components';
import { Colors } from 'constants/styles';

export const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate3d(-50%, calc(-100% - 24px), 0);
  z-index: 1300;
`;

export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  transition: all 0.3s ease-in;

  height: 40px;
  padding: 0 24px;
  background-color: ${Colors.PRIMARY_80};
  color: ${Colors.WHITE};
  font-size: 14px;
  border-radius: var(--border-radius-primary);
  font-weight: 400;
  white-space: nowrap;
  word-wrap: normal;
  ${({ isOpen }) => (isOpen ? `
    opacity: 1;
    visibility: visible;
    transform: translate3d(0, calc(100% + 48px) , 0);
  ` : `
    opacity: 0;
    visibility: hidden;
    transform: translate3d(0, 0, 0);
  `)}
`;
