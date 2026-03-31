import { typographies } from 'lumin-ui/dist/design-tokens/kiwi/js';
import styled, { css } from 'styled-components';

export const IconWrapper = styled.div<{ $open: boolean }>`
  height: 20px;
  width: 20px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  > .icon {
    transition: transform 0.1s ease;
    ${({ $open }) => css`
      transform: rotate(${$open ? '90deg' : '0deg'});
    `}
  }
`;

export const ListItemContent = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const OutlineTree = styled.div`
  flex-grow: 1;
  margin-top: 7px;
  overflow-x: hidden;
  overflow-y: auto;

  .isNesting {
    border-color: var(--kiwi-colors-core-secondary);
    color: var(--kiwi-colors-surface-on-surface);
    background-color: var(--kiwi-colors-core-secondary-container);
  }
`;

export const OutlineModalWrapper = styled.div`
  transition: height 0.4s;
  height: 0;
  overflow: hidden;
`;

export const EmptyOutlinesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  flex-grow: 1;
  .SvgElement {
    margin-top: var(--kiwi-spacing-6);
    margin-bottom: var(--kiwi-spacing-2);
  }
`;

export const ListItemRight = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
`;

export const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const ListItemPageNumber = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  opacity: 1;
  text-align: center;
`;

export const ListItemMenu = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  opacity: 0;
`;

export const OutlinePanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--kiwi-colors-surface-surface);
`;

export const OutlineBranch = styled.div<{
  $level: number;
  $isGroundLevel: boolean;
  $active: boolean;
  $isDragging: boolean;
  $isLeaf: boolean;
  $canModifyOutline: boolean;
}>`
  display: flex;
  align-items: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: var(--kiwi-border-radius-md);
  height: 40px;
  cursor: pointer;
  margin: 0 var(--kiwi-spacing-1);
  ${typographies.kiwi_typography_body_md};
  position: relative;

  ${({ $level, $isGroundLevel, $isDragging, $isLeaf, $canModifyOutline }) => css`
    padding-left: ${$isGroundLevel ? 4 : $level * 16}px;
    padding-right: 16px;
    color: var(--kiwi-colors-surface-on-surface);
    border: 1px solid transparent;

    ::before {
      content: '';
      display: block;
      position: absolute;
      inset: 0;
      border-radius: var(--kiwi-border-radius-md);
      background-color: var(--kiwi-colors-surface-on-surface);
      opacity: 0;
    }

    ${ContentWrapper} {
      ${!$isLeaf && ` max-width: calc(100% - 20px) `};
    }

    ${ListItemContent} {
      max-width: calc(100% - 24px - ${$isLeaf ? '20px' : '0px'});
      padding-left: ${$isLeaf ? '8px' : '2px'};
    }

    &:hover {
      ${$isDragging
        ? `
        ::before {
          opacity: 0;
        }
        opacity: var(--kiwi-opacity-disabled-on-container);
      `
        : `
        ::before {
          opacity: var(--kiwi-opacity-state-layer-hovered);
        }
        ${ListItemPageNumber} {
          ${$canModifyOutline && `opacity: 0`};
        }
        ${ListItemMenu} {
          opacity: 1;
        }
      `}
    }
  `}
`;

export const EmptyOutlineTitle = styled.span`
  ${typographies.kiwi_typography_body_md};
  color: var(--kiwi-colors-surface-on-surface-variant);
`;

export const OutlinePreviewContainer = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 99999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

export const OutlinePreviewLayer = styled.div`
  display: flex;
  align-items: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 40px;
  width: var(--lumin-left-panel-width);
  border-radius: var(--border-radius-dense);
  gap: 4px;
  ${typographies.kiwi_typography_body_md};
  color: var(--kiwi-colors-surface-on-surface);
  background-color: var(--kiwi-colors-surface-surface-container-highest);
  padding-left: 16px;
  padding-right: 16px;
`;

export const OutlineDragLine = styled.div<{ $level?: number }>`
  position: relative;

  &::after {
    ${({ theme, $level }) => `
      content: "";
      display: block;
      position: absolute;
      width: 100%;
      height: 2px;
      top: 0;
      left: ${$level === 0 ? 12 : 8 + $level * 16}px;
      border-radius: 99px;
      background-color: ${theme.le_main_primary};
    `}
  }
`;

export const OutlineTreeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const OutlineItemFooterContainer = styled.div`
  min-height: 2px;
  flex-grow: 1;
`;

export const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;
