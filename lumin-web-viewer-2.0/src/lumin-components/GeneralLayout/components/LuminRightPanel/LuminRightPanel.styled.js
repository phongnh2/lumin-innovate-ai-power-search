import styled, { css } from 'styled-components';

import { BasePanel, BasePanelContent } from '@new-ui/GeneralLayout.styled';

import { PanelWidth } from 'constants/styles';

export const RightPanelWrapper = styled(BasePanel)`
  ${({ $show }) =>
    $show &&
    css`
      width: ${PanelWidth.LUMIN_RIGHT_PANEL};
    `}
  min-width: 0px;
  background-color: var(--kiwi-colors-surface-surface-container-low);
  border-radius: var(--kiwi-border-radius-lg);
  overflow: hidden;
  flex-shrink: 0;
`;

export const RightPanelContent = styled(BasePanelContent)`
  transform: translate(var(--lumin-right-panel-width));
  width: var(--lumin-right-panel-width);
  right: 0px;
  border-radius: var(--kiwi-border-radius-lg);
  height: 100%;
  overflow: hidden;
  background-color: var(--kiwi-colors-surface-surface-container-low);

  ${({ $show }) =>
    $show &&
    `
      transform: none;
    `}
`;

export const ContentContainer = styled.div`
  height: 100%;
  background-color: var(--kiwi-colors-surface-surface-container);
`;

export const PanelWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

