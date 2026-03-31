import { typographies } from "constants/styles/editor";
import { css } from "styled-components";

export const CommentContentStyles = css`
  ${{...typographies.le_body_medium}};
  * {
    word-break: break-word;
  }

  .mention, .links > a {
    ${{...typographies.le_title_small}};
  }

  a, u {
    text-decoration: underline !important;
  }

  strong{
    font-weight: 700 !important;
  }

  ${({ theme }) => `
    color: ${theme.le_main_on_surface}; 
    .mention, .links > a {
      color: ${theme.le_main_primary};
    }
  `}
`;