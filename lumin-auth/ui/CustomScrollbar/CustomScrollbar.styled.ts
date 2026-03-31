import styled from '@emotion/styled';
import CustomScrollbars from 'react-custom-scrollbars-2';

export const Scrollbars = styled(CustomScrollbars)`
  .custom-scroll__thumb {
    background-color: var(--color-scrollbar);
    border-radius: 16px;
  }

  &:hover {
    .custom-scroll__thumb {
      background-color: var(--color-scrollbar-hover);
    }
  }
`;
