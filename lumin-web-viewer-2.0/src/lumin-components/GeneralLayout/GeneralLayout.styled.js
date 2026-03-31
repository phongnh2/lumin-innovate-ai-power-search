import styled, { css } from 'styled-components';

import { ZIndex } from 'constants/styles';

const BaseStyles = styled.div``;

export const BaseHeader = styled(BaseStyles)``;

export const BaseSideBar = styled(BaseStyles)`
  z-index: ${ZIndex.LUMIN_BASE_SIDE_BAR};
  background-color: transparent;
`;

export const GeneralLayoutBody = styled.div`
  display: flex;
  transition: height var(--focus-mode-transition);
  ${({ $isInFocusMode, $isInPresenterMode, $hasWarningBanner }) =>
    $isInFocusMode || $isInPresenterMode
      ? css`
          height: 100vh;
        `
      : css`
          height: calc(
            100vh - var(--lumin-title-bar-height) - ${$hasWarningBanner ? 'var(--warning-banner-height)' : '0px'}
          );
        `}
`;

export const GeneralLayoutInnerWrapper = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
  height: 100%;
  display: flex;
  ${({ $isInPresenterMode }) =>
    $isInPresenterMode &&
    css`
      justify-content: center;
      align-items: center;
      background-color: #000;
    `}
  background: var(--kiwi-colors-surface-surface-container);
  ${({ $isInPresenterMode }) =>
    $isInPresenterMode &&
    css`
      justify-content: center;
      align-items: center;
      background-color: #000;
    `}
`;

export const GeneralLayoutViewerWrapper = styled.div`
  flex-grow: 1;
  ${({ theme, $isDocumentRevision }) => css`
    background-color: ${$isDocumentRevision ? theme.kiwi_colors_surface_surface : 'transparent'};
  `}
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const BasePanel = styled.div`
  flex: 0 0 auto;
  width: 0;
  height: 100%;
  transition: var(--editor-transition);
  transition-property: transform, width, opacity;
  position: relative;
  overflow: hidden;
`;

export const BasePanelContent = styled.div`
  transition: var(--editor-transition);
  transition-property: transform, width, opacity;
  backface-visibility: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1 0 auto;
  position: absolute;
  top: 0px;
  outline: 0px;
`;

export const EditorPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--kiwi-colors-surface-surface-container-low);
  transition: background-color var(--editor-transition);
`;

export const MobileGeneralLayoutBody = styled.div`
  height: calc(100vh - var(--lumin-mobile-title-bar-height));
`;

export const DocumentOuterContainer = styled.div`
  width: 100%;
  min-width: 0;
  padding: 0 2px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  &[data-is-in-presenter-mode='true'] {
    padding: 0;
  }
`;
