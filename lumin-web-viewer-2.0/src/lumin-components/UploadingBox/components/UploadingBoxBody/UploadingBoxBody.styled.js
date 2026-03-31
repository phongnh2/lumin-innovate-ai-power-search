import styled from 'styled-components';

import { Fonts } from 'constants/styles';

export const Container = styled.div`
  transition: max-height 0.4s ease, opacity 0.4s ease;

  ${({ $isCollapse, $containerHeight }) =>
    $isCollapse
      ? `
    max-height: 0;
    opacity: 0;
    pointer-events: none;
    `
      : `
    overflow: hidden auto;
    max-height: ${$containerHeight}px;
    opacity: 1;
    pointer-events: auto;
    padding-right: 3px;
    margin-right: 3px;
  `}
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-primary-20);
  color: var(--color-neutral-80);
  font-size: 14px;
  padding: 0 16px;
  font-weight: 400;
  transition: all 0.3s ease;
  height: 44px;
  max-height: 44px;
  opacity: 1;
  pointer-events: auto;
  ${({ isDisplay }) =>
    !isDisplay &&
    `
    max-height: 0;
    opacity: 0;
    pointer-events: none;
  `};
`;

export const CancelButton = styled.button`
  cursor: pointer;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neutral-100);
  transition: color 0.3s ease;
  font-family: ${Fonts.PRIMARY};
  &:hover {
    color: var(--color-secondary-50);
  }
`;
