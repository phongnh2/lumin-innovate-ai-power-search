import styled, { css } from 'styled-components';

import { typographies, spacings } from 'constants/styles/editor';

export const Content = styled.div<{ $onlyCurrent?: boolean }>`
  display: flex;
  flex-grow: 1;
  flex-direction: column;

  ${({ $onlyCurrent }) =>
    $onlyCurrent
      ? css`
          padding: ${spacings.le_gap_2}px ${spacings.le_gap_0_5}px;
        `
      : css`
          padding: ${spacings.le_gap_1}px ${spacings.le_gap_0_5}px ${spacings.le_gap_2}px ${spacings.le_gap_1}px;
        `}
`;

export const ContentTitle = styled.span`
  ${{ ...typographies.le_label_large }};
`;

export const ContentAuthor = styled.span`
  ${{ ...typographies.le_body_small }};
`;

export const ContentButton = styled.div`
  margin: ${spacings.le_gap_0_5}px ${spacings.le_gap_0_5}px 0 0;
`;

export const Timeline = styled.div<{ $active: boolean; $onlyCurrent: boolean }>`
  position: relative;
  min-height: 100%;
  padding: ${spacings.le_gap_2}px ${spacings.le_gap_0_5}px ${spacings.le_gap_0} ${spacings.le_gap_3}px;

  &:after {
    content: '';
    ${({ $onlyCurrent }) =>
      $onlyCurrent &&
      `
      content: none;
    `}
    position: absolute;
    top: 0;
    right: 8px;
    z-index: 2;
    width: 2px;
    height: 100%;

    ${({ theme }) => `
      background-color: ${theme.le_main_outline_variant};
    `};
  }

  &:before {
    content: '';
    position: absolute;
    right: 4px;
    z-index: 4;
    width: 10px;
    height: 10px;
    border-radius: 50%;

    ${({ $onlyCurrent }) =>
      $onlyCurrent &&
      css`
        top: 50%;
        transform: translateY(-50%);
      `};

    ${({ theme, $active }) =>
      $active
        ? css`
            background-color: ${theme.le_main_outline};
          `
        : css`
            background-color: ${theme.le_main_surface_container_low};
            outline: 1px solid ${theme.le_main_outline_variant};
          `};
  }
`;

export const RevisionItem = styled.div<{ $active: boolean; $disabled: boolean; $onlyCurrent?: boolean }>`
  display: flex;
  transition: all var(--editor-transition);
  cursor: pointer;

  ${({ $disabled }) =>
    $disabled &&
    css`
      pointer-events: none;
    `}

  :first-child {
    ${Timeline} {
      &:after {
        top: 26px;
      }
    }
  }

  :last-child {
    ${Timeline} {
      &:after {
        height: 16px;
      }
    }
  }

  ${({ theme, $active }) =>
    $active
      ? css`
          background-color: ${theme.le_main_primary_container};

          ${ContentTitle}, ${ContentAuthor} {
            color: ${theme.le_main_on_primary_container};
          } ;
        `
      : css`
          background-color: transparent;

          ${ContentTitle}, ${ContentAuthor} {
            color: ${theme.le_main_on_surface_variant};
          } ;
        `};
`;
