import styled, { css } from 'styled-components';

type ContainerProps = {
  $isUpdateContent: boolean;
};

export const FooterContainer = styled.div<ContainerProps>`
  display: flex;
  gap: var(--kiwi-spacing-2);
  padding: 0 var(--kiwi-spacing-2) var(--kiwi-spacing-2);

  ${(props) =>
    props.$isUpdateContent &&
    css`
      padding: 0;
    `}
`;
