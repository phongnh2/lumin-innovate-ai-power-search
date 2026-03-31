import styled from 'styled-components';

import { stretchParent } from 'utils/styled';
import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors } from 'constants/styles';

const disableArea = ({ $isOffline }) =>
  $isOffline &&
  `
  opacity: .5;
  pointer-events: none;
`;

export const Container = styled.div`
  position: relative;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1;
`;

export const Warning = styled.div`
  width: 100%;
`;

export const WarningReskin = styled.div`
  width: 100%;

  &.disabled {
    cursor: not-allowed;
    opacity: var(--kiwi-opacity-disabled-on-container);
    position: relative;

    &::before {
      content: '';
      pointer-events: none;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }

    & > * {
      pointer-events: none;
    }
  }
`;

export const MainPage = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
  overflow: hidden;
`;

export const LeftSidebar = styled.div`
  width: var(--left-sidebar-width);
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
  background-color: ${Colors.WHITE};
  z-index: 100;
  box-sizing: border-box;
`;

export const RightSidebar = styled.div`
  width: var(--lumin-right-side-bar-width);
  box-sizing: border-box;
`;

export const SidebarReskin = styled.div`
  width: var(--main-sidebar-width);
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
  background-color: var(--kiwi-colors-surface-surface-container-lowest);
  z-index: 100;
  box-sizing: border-box;

  ${({ $offline }) =>
    $offline &&
    `
    cursor: not-allowed;
    opacity: var(--kiwi-opacity-disabled-on-container);

    & > * {
      pointer-events: none;
    }
  `}
`;

export const ContentContainerReskin = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--kiwi-colors-surface-surface-container-lowest);

  ${mediaQuery.xl`
    margin-left: ${({ $sidebar }) => ($sidebar ? 'var(--main-sidebar-width)' : 'inherit')};
  `}
`;

export const ContentContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  ${mediaQuery.xl`
    margin-left: ${({ $sidebar }) => ($sidebar ? 'var(--left-sidebar-width)' : 'inherit')};
  `}
`;

export const ChildrenWrapper = styled.div`
  box-sizing: border-box;
  flex: 1;
  width: 100%;
  overflow-x: hidden;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  ${disableArea}
`;

export const ChildrenWrapperReskin = styled.div`
  box-sizing: border-box;
  flex: 1;
  width: 100%;
  overflow-x: hidden;
  scroll-behavior: smooth;
  ${disableArea}

  ${mediaQuery.xl`
     padding: 0;
  `}
`;

export const ChildrenContainer = styled.div`
  box-sizing: border-box;
  ${stretchParent}
  width: 100%;
  height: 100%;
  background-color: white;
  min-height: 0;
  ${mediaQuery.xl`
    ${({ $fullWidth }) =>
      !$fullWidth &&
      `
      padding: 0 48px;
      max-width: calc(var(--app-container-width) + 48px * 2);
    `}
    margin: 0 auto;
  `}
`;

export const ChildrenContainerReskin = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  scroll-behavior: smooth;
  background-color: var(--kiwi-colors-surface-surface-container-lowest);
  display: flex;
  flex-direction: column;

  ${({ $isInSignDocListPage }) =>
    $isInSignDocListPage &&
    `
    background-color: transparent;
  `}

  > :first-child {
    &#prompt-invite-users-banner {
      margin: var(--kiwi-spacing-3);
      width: unset;
    }

    ${({ $isInDocList }) =>
      $isInDocList &&
      `
    &:not(#prompt-invite-users-banner) {
      padding-top: var(--kiwi-spacing-3);
    }
    `}
  }

  ${mediaQuery.xl`
    margin: 0 auto;
    ${({ $sidebar }) =>
      $sidebar &&
      `
    border-top-right-radius: var(--kiwi-border-radius-lg);
    border-top-left-radius: var(--kiwi-border-radius-lg);
  `}

    ${({ $isHomePage }) =>
      $isHomePage &&
      `
      border-top-left-radius: var(--kiwi-border-radius-md);
      border-top-right-radius: var(--kiwi-border-radius-md);
    `}

    ${({ $isInAgreementModulePage }) =>
      $isInAgreementModulePage &&
      `
      border-radius: unset;
    `}

    > :first-child {
      &#prompt-invite-users-banner {
        margin-top: var(--kiwi-spacing-1-5);
        margin-left: var(--kiwi-spacing-4);
      }
    }
  `}

  ${(props) =>
    props.$reskinScrollbar &&
    `
      &::-webkit-scrollbar {
        width: var(--kiwi-spacing-1-25);
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background-color: var(--scrollbar-thumb-color);
        border-radius: var(--kiwi-border-radius-lg);
        border: var(--kiwi-spacing-0-25) solid transparent;
        background-clip: padding-box;
      }

      &::-webkit-scrollbar-button {
        display: none;
      }
  `}
`;

export const ContentWrapper = styled.div`
  overflow: hidden;
  flex: 1 1 0%;
`;

export const ChildrenContentWrapperReskin = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  min-height: 0;
  background-color: var(--kiwi-colors-surface-surface-container-low);
  position: relative;

  ${mediaQuery.md`
    ${({ $isInDocumentPage, $sidebar }) =>
      $isInDocumentPage &&
      $sidebar &&
      `
        width: calc(100% - var(--lumin-right-side-bar-width));
      `}
  `}

  ${({ $isHomePage }) =>
    $isHomePage &&
    `
    padding: var(--kiwi-spacing-1-5) var(--kiwi-spacing-2) 0px var(--kiwi-spacing-2);
  `}

  ${({ $isInXeroIntegrationPage }) =>
    $isInXeroIntegrationPage &&
    `
      padding: var(--kiwi-spacing-0);
    `}

  ${mediaQuery.xl`
     ${({ $sidebar }) =>
       $sidebar &&
       `
      border-top-left-radius: var(--kiwi-border-radius-lg);
      padding: var(--kiwi-spacing-1-5) var(--kiwi-spacing-2) 0px var(--kiwi-spacing-2);
     `}

       ${({ $isInXeroIntegrationPage }) =>
         $isInXeroIntegrationPage &&
         `
          padding: var(--kiwi-spacing-0);
        `}

    ${({ $fullScreen }) =>
      $fullScreen &&
      `
      padding: unset;
      border-radius: unset;
    `}

    ${({ $isHomePage }) =>
      $isHomePage &&
      `
      border-top-left-radius: var(--kiwi-border-radius-lg);
    `}

    ${({ $isInAgreementModulePage }) =>
      $isInAgreementModulePage &&
      `
      padding: unset;
      border-radius: unset;
      background-color: unset;
    `}

    ${({ $isInDocumentPage }) =>
      $isInDocumentPage &&
      `
        border-top-right-radius: var(--kiwi-border-radius-lg);
    `}
 `}
`;
