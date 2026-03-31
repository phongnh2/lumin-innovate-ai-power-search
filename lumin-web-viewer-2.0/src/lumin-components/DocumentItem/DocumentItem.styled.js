import styled from 'styled-components';
import * as ButtonMoreStyled from 'lumin-components/ButtonMore/ButtonMore.styled';

import { mediaQuery } from 'utils/styles/mediaQuery';

export const Text = styled.span`
  font-size: 10px;
  line-height: 12px;
  font-stretch: normal;
  letter-spacing: 0.34px;
  color: var(--color-neutral-80);
  font-weight: 400;
  ${mediaQuery.md`
    font-size: 12px;
    line-height: 16px;
  `}
`;

export const DocumentStatus = styled.div`
  display: none;
  position: absolute;
  z-index: 3;
  top: -6px;
  left: -6px;
  width: 12px;
  height: 12px;
  ${mediaQuery.md`
    display: block;
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 12px;
    height: 12px;
    background-color: var(--color-secondary-20);
    border-radius: 50%;
    z-index: 0;
  }
  &::after {
    content: '';
    top: 3px;
    left: 3px;
    position: absolute;
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--color-secondary-50);
    z-index: 1;
  }
`;

export const ExpiredTag = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-neutral-20);
  border: var(--border-primary);
  box-sizing: border-box;
  border-radius: 4px;
  color: var(--color-neutral-100);
  font-weight: 600;
  text-align: center;
  line-height: 12px;
  z-index: 1;
`;
export const Container = styled.div`
  ${(props) => (props.$disabledSelection && `
    .FavoriteIcon--disabled, ${ButtonMoreStyled.CustomPopperButton} {
      opacity: 1;
    }
  `)}
  ${(props) => (!props.$disabledSelection && props.$disabledActions && `
    ${ButtonMoreStyled.CustomPopperButton} {
      opacity: 0.5;
    }
  `)}
`;
export const ButtonMore = styled.div`
  ${(props) => props.$disabled && `
    ${ButtonMoreStyled.CustomPopperButton} {
      cursor: not-allowed;
      pointer-events: auto;
    }
  `}
`;
