import styled, { css } from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  ${({ $isReskin, $single, $smallGap }) => {
    if ($isReskin) {
      return css`
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: var(--kiwi-spacing-2);
      `;
    }
    return css`
      display: grid;
      grid-template-columns: ${$single ? '100%' : '1fr 1fr'};
      gap: 16px;
      ${mediaQuery.md`
        gap: ${$smallGap ? '16px' : '24px'};
      `}
    `;
  }}
`;
