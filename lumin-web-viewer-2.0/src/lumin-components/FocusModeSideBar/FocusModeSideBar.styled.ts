import styled, { css } from 'styled-components';
import IconButton from '@new-ui/general-components/IconButton';

export const FocusModeSideBar = styled.div<{isLeftSideBar: boolean}>`
  position: absolute;
  bottom: 0;

  background: var(--kiwi-colors-surface-surface-container-lowest);
  box-shadow: var(--kiwi-shadow-2);
  transition: all var(--focus-mode-transition);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  ${({ isLeftSideBar }) => isLeftSideBar ? css`
    left: 0;
    border-top-right-radius: var(--kiwi-border-radius-lg);
    padding: var(--kiwi-spacing-2-5) var(--kiwi-spacing-2) var(--kiwi-spacing-2);
  ` : css`
    right: 0;
    border-top-left-radius: var(--kiwi-border-radius-lg);
    padding: var(--kiwi-spacing-0-5);
  `}
`;

export const ExpanderWrapper = styled.div`
  position: absolute;
  left: 0;
  bottom: 12px;
  z-index: var(--zindex-focus-mode-expand-button);
  padding: var(--kiwi-spacing-0-5);
  border-radius: 0px var(--kiwi-border-radius-md) var(--kiwi-border-radius-md) 0px;
  background: var(--kiwi-colors-surface-surface-container);
  opacity: 0;
  pointer-events: none;
  transition: all var(--focus-mode-transition);
  &[data-is-focus-mode='true'] {
    opacity: 1;
    pointer-events: all;
  }
`;

export const ExpanderButton = styled(IconButton)<{$show: boolean}>`
  background: var(--kiwi-colors-surface-surface-container-lowest);
  opacity: ${({ $show }) => $show ? 0 : 1};
  transition: all var(--focus-mode-transition);
  width: 28px;
  min-width: 28px;
`;
