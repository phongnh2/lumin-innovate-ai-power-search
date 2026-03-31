import { Colors } from 'constants/styles';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
export const Highlight = styled.div`
  flex: 1;
  position: relative;
  
  &:before {
    content: '';
    display: block;
    position: absolute;
    top: -24px;
    left: -24px;
    pointer-events: none;
    width: calc(100% + 24px * 2);
    height: calc(100% + 24px  + 16px);
    z-index: -1;

    background-color: transparent;
    border: 1px solid transparent;
    border-radius: var(--border-radius-primary);
    transition: background-color 0.3s ease, border-color 0.3s ease;

    ${(props) => props.$active && `
      background-color: ${Colors.PRIMARY_10};
      border-color: ${Colors.PRIMARY_80};
    `}
  }
`;
