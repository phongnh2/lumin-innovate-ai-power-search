import styled, { css } from 'styled-components';

export const DocumentContainerItself = styled.div`
  --background-color: color-mix(in srgb, var(--kiwi-colors-surface-on-surface) 16%, transparent);
  width: 100%;
  ${({ $bannerHeight, $isNarrowScreen }) =>
    $bannerHeight || $isNarrowScreen
      ? css`
          border-radius: 0;
        `
      : css`
          border-top-left-radius: var(--kiwi-border-radius-md);
          border-top-right-radius: var(--kiwi-border-radius-md);
        `};
  -ms-overflow-style: none; /* for Internet Explorer, Edge */
  display: flex;
  flex-direction: column;
  overflow: auto;
  user-select: none;
  padding: var(--kiwi-spacing-6) 0;
  transition: all var(--editor-transition);
  height: ${({ $bannerHeight }) => `calc(100% - ${$bannerHeight}px)`};
  margin: 0 auto;
  ${(props) =>
    props.$isLoadingDocument &&
    css`
      position: relative;
    `}
  background-color: var(--kiwi-colors-surface-surface);
  background-image: radial-gradient(var(--background-color) 1px, transparent 1px);
  background-size: 26px 26px;

  ${(props) =>
    props.$isPreviewOriginalVersionMode &&
    css`
      width: 100%;
      margin-left: 0;
      margin-right: 0;
      border-radius: 0;
    `}

  .pageContainer:after {
    position: absolute;
    content: '';
    inset: 0;
    /* because auxilary canvas z-index is 30  */
    z-index: 31;
    border: 1px solid ${({ theme }) => theme.le_main_outline_variant};
  }
  .pageContainer {
    background-color: ${({ theme }) => theme.kiwi_colors_surface_surface};
  }

  .pageContainer-blocked {
    opacity: 0.38 !important;
    &::after {
      content: '';
      display: flex;
      align-items: center;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      justify-content: center;
      z-index: 100;
      background-color: unset !important;
      ${({ theme }) => `
        border: 1px solid ${theme.le_main_primary}!important;
      `}
    }
  }

  &[data-disabled='true'] {
    opacity: 0.5;
    .pageSection {
      transition: opacity var(--editor-transition);

      &:after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 101;
        cursor: wait;
      }
    }
  }

  &[data-locked='true'] {
    overflow: hidden;
  }
`;

export const DocumentContainerWrapper = styled.div`
  flex-grow: 1;
  box-sizing: content-box;
  background-color: var(--kiwi-colors-surface-surface-container);
  transition: var(--editor-transition);
  transition-property: background-color, width;

  height: 100%;
  width: 100%;
  ${(props) =>
    props.$isPreviewOriginalVersionMode &&
    css`
      width: 100%;
      margin-left: 0;
      margin-right: 0;
    `}
  ${({ theme, $isDocumentRevision }) =>
    $isDocumentRevision &&
    css`
      max-width: calc(100vw - var(--lumin-revision-tool-property-width));
      margin: 0;
      background-color: ${theme.kiwi_colors_surface_surface};

      ${DocumentContainerItself} {
        background-color: ${theme.kiwi_colors_surface_surface_container_low};
        border-radius: var(--border-radius-primary) var(--border-radius-primary) 0 0;
      }
    `}

  &[data-locked='true'] {
    pointer-events: none;
    position: relative;
  }
`;

export const SkeletonContainer = styled.div`
  position: absolute;
  inset: 0;
  z-index: var(--zindex-document-skeleton-container);
`;

export const BannerWrapper = styled.div`
  border-radius: 8px 8px 0 0;
  ${({ $isLoadingDocument }) =>
    $isLoadingDocument &&
    css`
      display: none;
    `}
`;

export const DocumentElement = styled.div`
  .outlineIconContainer {
    display: none;
  }

  &[data-default-mode='true'][data-offline-mode='false'] {
    .outlineIconContainer {
      display: block;
    }
  }
`;

export const LoadingBarWrapper = styled.div`
  position: relative;
`;

export const FloatingToolbarWrapper = styled.div`
  position: relative;
`;
