import styled, { css } from 'styled-components';

import { BasePanel, BasePanelContent } from 'luminComponents/GeneralLayout/GeneralLayout.styled';

export const ToolPropertiesContent = styled(BasePanelContent)`
  width: var(--lumin-tool-properties-width);
  right: calc(var(--lumin-tool-properties-offset) / 2);
  background-color: var(--kiwi-colors-surface-surface);
  border-radius: var(--kiwi-border-radius-md);
`;

export const ToolPropertiesWrapper = styled(BasePanel)`
  &[data-show='true'] {
    padding-left: 2px;
    ${({ isRevision }) =>
      isRevision
        ? css`
            width: var(--lumin-revision-tool-property-width);
            ${ToolPropertiesContent} {
              width: var(--lumin-revision-tool-property-width);
              right: 0;
              background-color: transparent;
              border-radius: var(--border-radius-primary) var(--border-radius-primary) 0 0;
            }
          `
        : css`
            width: calc(var(--lumin-tool-properties-offset) + var(--lumin-tool-properties-width));
          `}
  }
  ${({ theme, isRevision }) => css`
    background-color: ${isRevision ? theme.kiwi_colors_surface_surface : 'transparent'};
  `}
`;
