import ButtonCore from '@mui/material/Button';
import styled from 'styled-components';

import Icomoon from 'luminComponents/Icomoon';

import { Colors } from 'constants/styles';

export const Container = styled.div`
  width: 100%;
  border: solid 1px ${Colors.NEUTRAL_20};
  background-color: ${Colors.WHITE};
  border-radius: 8px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  ${(props) => (props.disabled ? `
    opacity: 0.5;
    cursor: not-allowed;
  ` : `
    &:hover {
      box-shadow: var(--shadow-xs);
      border: solid 1px ${Colors.PRIMARY_80}
    }
  `)};
`;
export const ButtonContainer = styled(ButtonCore)`
  width: 100%;
  padding: 0;
  text-transform: none;
  &:hover {
    background-color: transparent;
  }
`;
export const ButtonWrapper = styled.div`
  display: grid;
  grid-template-columns: min-content minmax(0, 1fr) 16px;
  column-gap: 8px;
  padding: 12px 14px 12px 8px;
  width: 100%;
  align-items: center;
`;
export const ContentContainer = styled.div`
  overflow: hidden;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
export const IconToggle = styled(Icomoon)`
  &:before {
    transform: ${({ isOpen }) => (isOpen ? 'none' : 'transform: rotate(180deg)')};
  }
`;
export const ToggleArrow = styled.div`
  height: 12px;
  width: 12px;

  ${({ isOpen }) => (isOpen ? '' : 'transform: scaleY(-1)')};
  transition: all 0.3s ease-out;
  text-align: center;
  transform-origin: center center;
`;
