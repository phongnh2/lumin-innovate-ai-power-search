import styled from "styled-components"
import { mediaQuery } from 'utils/styles/mediaQuery';
import { typographies } from 'constants/styles/editor';

export const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const Image = styled.img`
  width: 120px;
  min-height: 120px;
  margin: 0 auto;
  ${mediaQuery.md`
    width: 180px;
    min-height: 180px;
  `}
`;

export const Title = styled.h1`
  ${{...typographies.le_headline_small}};
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
  `}
  margin-top: 16px;

  ${({ $isWrap }) => $isWrap && `
    max-width: 65%;
  `}

  ${mediaQuery.sm`
    ${{...typographies.le_headline_large}};
    margin-top: 24px;
  `}
`;

export const Message = styled.div`
  ${{...typographies.le_body_medium}}

  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
  `}

  text-align: left;
  margin-top: 12px;

  ${mediaQuery.sm`
    ${{...typographies.le_body_large}}
  `}

  & > b {
    ${({ theme }) => `
      color: ${theme.le_main_primary};
    `}
  }
`;
export const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  margin-top: 16px;

  ${mediaQuery.md`
    flex-direction: row;
    margin-top: 24px;
  `}

  ${({ $flexEnd }) => !$flexEnd ? `
    justify-content: space-between;
  ` : `
    justify-content: flex-end;
  `}

  .flex-start {
    margin-left: -13px;
  }

  button, a {
    ${{...typographies.le_label_medium}};
    height: 32px;

    ${mediaQuery.sm`
      ${{...typographies.le_label_large}};
      height: 44px;
      width: unset;
    `}
  }
`;