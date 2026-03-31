import styled from 'styled-components';

import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s ease;
  background-color: #fff;
  ${({ $showHighlight }) => $showHighlight && `
    background-color: transparent;
  `}
  margin-bottom: 16px;
  ${mediaQuery.md`
    margin-bottom: 8px;
  `}
`;
export const ContainerReskin = styled.div`
  transition: background-color var(--default-web-transition-duration) ease;
  margin-bottom: var(--kiwi-spacing-1-25);
  ${({ $showHighlight }) => $showHighlight && `
    background-color: transparent;
  `}
`;

export const WrapperReskin = styled.div`
  display: grid;
  grid-template-columns: fit-content(100%) max-content;
  gap: calc(var(--kiwi-spacing-7) + var(--kiwi-spacing-0-5));
  justify-content: space-between;
  ${({ $isChatbotOpened }) =>
    $isChatbotOpened &&
    `
    gap: var(--kiwi-spacing-1);
  `}
  ${mediaQuery.lg`
    gap: var(--kiwi-spacing-10);
    ${({ $isChatbotOpened }) =>
      $isChatbotOpened &&
      `
      gap: var(--kiwi-spacing-8);
    `}
  `}
  ${mediaQuery.xxxl`
    gap: calc(var(--kiwi-spacing-15) * 2 + var(--kiwi-spacing-1-75));
  `}
`;

export const Title = styled.h4`
  font-size: 14px;
  color: var(--color-neutral-100);
  font-weight: 600;
  line-height: 1.4;
  ${mediaQuery.md`
    font-size: 17px;
  `}
  ${mediaQuery.xl`
    font-size: 20px;
  `}
`;
