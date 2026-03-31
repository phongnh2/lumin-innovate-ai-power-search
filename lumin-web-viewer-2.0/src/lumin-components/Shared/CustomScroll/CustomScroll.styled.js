import styled from 'styled-components';
import CustomScrollbars from 'react-custom-scrollbars-2';

export const Scrollbars = styled(CustomScrollbars)`
  .custom-scroll__thumb {
    background-color: rgb(32 33 36 / 20%);
    border-radius: 16px;
  }
  &:hover {
    .custom-scroll__thumb {
      background-color: rgb(32 33 36 / 38%);
    }
  }
`;
