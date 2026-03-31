import styled, { css } from 'styled-components';

import { BaseHeader } from 'luminComponents/GeneralLayout/GeneralLayout.styled';

import { HeaderLayout, ZIndex } from 'constants/styles';

export const Header = styled(BaseHeader)`
  position: relative;
  z-index: ${ZIndex.LUMIN_HEADER_BAR};
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  ${({ theme, $isDocumentRevision }) => `
    background-color: ${
      $isDocumentRevision ? theme.kiwi_colors_surface_surface : 'var(--kiwi-colors-surface-surface-container-low)'
    };
  `}

  transition: all var(--focus-mode-transition);
  ${({ $isInFocusMode, $isInPresenterMode }) =>
    $isInFocusMode || $isInPresenterMode
      ? css`
          opacity: 0;
          padding: 0;
          height: 0;
          visibility: hidden;
        `
      : css`
          opacity: 1;
          padding: var(--kiwi-spacing-0-5) var(--kiwi-spacing-1);
          height: ${HeaderLayout.LuminTitleBarHeight};
          visibility: visible;
        `}
`;
