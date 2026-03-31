import styled, { css } from 'styled-components';

import { BasePanel, BasePanelContent } from 'luminComponents/GeneralLayout/GeneralLayout.styled';

export const LeftPanelWrapper = styled(BasePanel)`
  ${({ show }) =>
    show &&
    css`
      width: calc(var(--lumin-left-panel-offset) + var(--lumin-left-panel-width));
    `}
`;

export const LeftPanelContent = styled(BasePanelContent)`
  transform: translate(calc(calc(var(--lumin-left-panel-width) + calc(var(--lumin-left-panel-offset) / 2)) * -1));
  width: var(--lumin-left-panel-width);
  left: calc(var(--lumin-left-panel-offset) / 2);
  border-radius: 8px;
  background-color: var(--kiwi-colors-surface-surface);
  ${({ show }) =>
    show &&
    css`
      transform: none;
    `}
`;

export const HeaderPanel = styled.div`
  padding: var(--kiwi-spacing-1) 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderWrapper = styled.div`
  position: sticky;
  top: 0;
  padding: 0 12px;
  z-index: 1;
  background: var(--kiwi-colors-surface-surface);
  .MuiDivider-root {
    margin: 0 !important;
  }
`;
