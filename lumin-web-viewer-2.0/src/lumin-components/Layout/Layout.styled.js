import styled from 'styled-components';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors, Fonts } from 'constants/styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100vh;

  ${({ $brLayout, $withCenterFrame, theme }) =>
    ($brLayout || $withCenterFrame) &&
    `
    background: ${
      $withCenterFrame ? 'var(--kiwi-colors-surface-surface-container-lowest)' : theme.le_main_surface_container_lowest
    };
    min-height: 100vh;
  `}
  ${mediaQuery.sm`
    ${({ $brLayout, $withCenterFrame, theme }) =>
      $brLayout &&
      !$withCenterFrame &&
      `
      background: ${theme.le_main_surface_container};
    `}
  `}
    ${mediaQuery.md`
    ${({ $withCenterFrame }) =>
      $withCenterFrame &&
      `
      background: var(--kiwi-colors-surface-surface-container);
    `}
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

export const NewFrameLayout = styled.div`
  width: 100%;
  padding: 0 16px;

  background: transparent;

  ${mediaQuery.sm`
    border-radius: 24px;
    padding: 32px;

    width: 636px;
    max-width: calc(100% - 64px);
    ${({ theme }) => `
      background: ${theme.le_main_surface_container_lowest}
    `}
  `}
`;

export const Header = styled.header`
  height: var(--header-secondary-height);
  display: flex;
  align-items: center;
  padding: 0 10px;
  position: sticky;
  flex-shrink: 0;
  top: 0;
  left: 0;
  z-index: calc(var(--zindex-popover) + 1);
  box-sizing: border-box;
  ${({ $brLayout }) =>
    $brLayout
      ? `
    background: transparent;
  `
      : `
    background: white;
    border-bottom: 1px solid ${Colors.NEUTRAL_20};
  `}
`;

export const LogoIcon = styled.img`
  height: 24px;
  ${mediaQuery.md`
    height: 32px;
  `}
`;
export const HomeLink = styled.a``;

export const BackWrapper = styled.div`
  display: ${({ $isStaticPage }) => ($isStaticPage ? 'none' : 'block')};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
`;

export const Main = styled.main`
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  flex: 1;
  display: flex;
  flex-direction: column;

  ${({ $isSupportLink }) =>
    $isSupportLink &&
    `
    justify-content: space-between;
  `}

  ${mediaQuery.sm`
    ${({ $brLayout, $withCenterFrame }) =>
      $brLayout &&
      !$withCenterFrame &&
      `
      align-items: center;
      justify-content: center;
      margin-top: calc(var(--auth-header-height) * -1);
    `}
  `}

  ${mediaQuery.md`
    ${({ $withCenterFrame }) =>
      $withCenterFrame &&
      `
      align-items: center;
      justify-content: center;
      margin-top: calc(var(--header-layout-secondary-height) * -1);
    `}
  `}
`;

export const Footer = styled.footer`
  min-height: var(--footer-secondary-height);
  display: flex;
  align-items: center;
  flex-direction: column-reverse;
  background: ${Colors.OTHER_1};
  z-index: 3;
  justify-content: space-between;
  flex-shrink: 0;
  ${mediaQuery.md`
    padding: 0 16px;
    flex-direction: row;
  `}
  ${mediaQuery.xxl`
    padding-left: calc(50vw - var(--container-primary) / 2);
    padding-right: calc(50vw - var(--container-primary) / 2);
  `}
`;

export const FooterText = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-weight: 400;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.43;
  letter-spacing: 0.34px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 16px;
  ${mediaQuery.md`
    margin-bottom: 0;
    text-align: left;
    max-width: 450px;
  `}
  ${mediaQuery.xl`
    max-width: none;
  `}
`;
export const LogoContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: ${({ $isStaticPage }) => ($isStaticPage ? 'flex-start' : 'center')};
  padding-left: ${({ $isStaticPage }) => ($isStaticPage ? '14px' : '0')};
`;
export const BackText = styled.span`
  display: none;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.43;
  color: ${Colors.NEUTRAL_80};
  ${mediaQuery.md`
    display: inline-block;
  `}
`;
export const SocialFooter = styled.div`
  margin-top: 16px;
  ${mediaQuery.md`
    flex-shrink: 0;
    margin: 0;
  `}
`;
export const SocialLink = styled.a`
  margin: 0 6px;
`;
export const IconSocial = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  ${mediaQuery.md`
    width: 40px;
    height: 40px;
  `}
`;

export const Divider = styled.div`
  box-sizing: content-box;
  height: 1px;
  width: 100%;
  background-color: ${Colors.NEUTRAL_20};
  margin: 12px 0 16px;
  ${mediaQuery.md`
    display: none;
  `}
`;

export const Link = styled.div`
  ${({ $disabled }) =>
    $disabled
      ? `
    pointer-events: none;
  `
      : `cursor: pointer;`}
`;
