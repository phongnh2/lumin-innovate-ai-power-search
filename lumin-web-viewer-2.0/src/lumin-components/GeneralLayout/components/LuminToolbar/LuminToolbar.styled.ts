import styled, { css } from 'styled-components';

import { BaseHeader } from 'luminComponents/GeneralLayout/GeneralLayout.styled';

import { ZIndex } from 'constants/styles';

interface ToolbarProps {
  $isInPresenterMode?: boolean;
  $isPreviewOriginalVersionMode?: boolean;
}

interface ToolbarSectionWrapperProps {
  $hide?: boolean;
}

export const Toolbar = styled(BaseHeader)<ToolbarProps>`
  position: relative;
  z-index: ${ZIndex.LUMIN_TOOL_BAR};
  ${({ $isInPresenterMode, $isPreviewOriginalVersionMode }) => ($isInPresenterMode || $isPreviewOriginalVersionMode) ? css`
    height: 0;
    opacity: 0;
    visibility: hidden;
  `: css`
    opacity: 1;
    visibility: visible;
  `}
`;

export const ToolbarInner = styled.div`
  background-color: var(--kiwi-colors-surface-surface-container);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
`;

export const ToolbarSectionWrapper = styled.div<ToolbarSectionWrapperProps>`
  display: flex;
  column-gap: 4px;
  align-items: center;
  height: var(--lumin-tool-bar-height);
  > hr.MuiDivider-vertical {
    height: 18px;
  }
  opacity: 1;
  transition: opacity var(--editor-transition);
  ${({ $hide }) => $hide && css`
    opacity: 0;
    visibility: hidden;
  `}
`;
