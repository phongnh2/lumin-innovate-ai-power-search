import { Button } from 'lumin-ui/kiwi-ui';
import styled, { css } from 'styled-components';

import { BaseSideBar } from 'luminComponents/GeneralLayout/GeneralLayout.styled';

import { spacings, typographies } from 'constants/styles/editor';

export const LeftSideBar = styled(BaseSideBar)<{ $isInFocusMode: boolean; $isInPresenterMode: boolean }>`
  position: relative;
  left: 0;
  width: var(--lumin-left-side-bar-width);
  transition: all var(--focus-mode-transition);
  &[data-navigation-expanded='true'] {
    --lumin-left-side-bar-width: var(--lumin-left-side-bar-width-expanded);
  }

  ${({ $isInFocusMode, $isInPresenterMode }) =>
    $isInFocusMode || $isInPresenterMode
      ? css`
          width: 0;
          opacity: 0;
          visibility: hidden;
        `
      : css`
          opacity: 1;
          visibility: visible;
        `}
`;

export const LeftSideBarWrapper = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

export const LeftSideBarBottom = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--kiwi-spacing-2);
`;

export const LeftSideBarContent = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${spacings.le_gap_2}px;
  padding: ${spacings.le_gap_0_5}px;
  min-width: var(--lumin-left-side-bar-width);
  width: var(--lumin-left-side-bar-width);

  &[data-navigation-expanded='true'] {
    --lumin-left-side-bar-width: var(--lumin-left-side-bar-width-expanded);
    padding: var(--kiwi-spacing-0-5) var(--kiwi-spacing-2);
    flex-shrink: 0;
    height: auto;
  }
`;

export const SubTitle = styled.span`
  ${{ ...typographies.le_title_large }};
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
  `}
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_2}px;
`;

export const Content = styled.ul`
  list-style: disc;
  list-style-position: outside;
  padding-left: 16px;
  & li {
    ${{ ...typographies.le_body_medium }};
    margin-bottom: 4px;
  }
`;

export const Footer = styled.div`
  display: flex;
  > button:first-child {
    margin-left: auto;
  }
`;

export const SecondaryButton = styled(Button)`
  margin-right: 16px;
`;
