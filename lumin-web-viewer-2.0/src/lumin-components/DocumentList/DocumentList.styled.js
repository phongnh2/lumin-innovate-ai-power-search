import styled, { css } from 'styled-components';

import BaseVirtualizedList from 'luminComponents/VirtualizedList';

import { stretchChildren, stretchParent } from 'utils/styled';
import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors } from 'constants/styles';

const DROPZONE_PADDING = 16;
const isHighlight = (...args) => css`
  ${({ $showHighlight }) => $showHighlight && css(...args)}
`;

const isEmptyList = (...args) => css`
  ${({ $isEmptyList }) => $isEmptyList && css(...args)}
`;

export const UploadDropZoneHighlight = styled.div`
  ${mediaQuery.xl`
    margin: -${DROPZONE_PADDING}px;
    padding: ${DROPZONE_PADDING}px;
    transition: background-color 0.3s ease;
    border-radius: var(--border-radius-primary);
    position: relative;
    box-sizing: border-box;
    z-index: 1;
    ${stretchChildren}
    ${({ $isMultipleSelecting, $isWindowDragging }) =>
      $isWindowDragging &&
      !$isMultipleSelecting &&
      `
      overflow: hidden;
    `}
    ${isHighlight`
      background-color: ${Colors.PRIMARY_10};
    `}
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 1px solid transparent;
      border-top: none;
      border-radius: 0 0 var(--border-radius-primary) var(--border-radius-primary);
      transition: border 0.3s ease;
      z-index: -1;
      ${isHighlight`
        border-color: ${Colors.PRIMARY_80};
      `}
    }
  `}
`;
export const UploadDropZoneHighlightReskin = styled.div`
  height: 100%;
  overflow: hidden;
  ${isEmptyList`
    overflow-y: scroll;
  `}
  ${mediaQuery.md`
    margin: 0 var(--kiwi-spacing-1);
    transition: var(--default-web-transition);
    position: relative;
    box-sizing: border-box;
    z-index: 1;
    ${stretchChildren}
    ${({ $isMultipleSelecting, $isWindowDragging }) =>
      $isWindowDragging &&
      !$isMultipleSelecting &&
      `
      overflow: hidden;
    `}
    ${({ $showHighlight }) =>
      $showHighlight &&
      `
      border-radius: var(--kiwi-border-radius-md);
    `}
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      transition: var(--default-web-transition);
      border-radius: var(--kiwi-border-radius-md);
      z-index: -1;
      overflow: visible;
      ${isHighlight`
        background-color: var(--kiwi-colors-custom-role-web-surface-blue);
      `}
    }
  `}
  ${mediaQuery.xl`
    margin: 0;
    &:before {
      left: 0;
      right: 0;
    }
  `}
`;

export const DocumentListWrapperReskin = styled.div`
  height: calc(100% - var(--kiwi-spacing-0-25));
  position: relative;
  top: var(--kiwi-spacing-0-25);
  padding: 0 var(--kiwi-spacing-2);
  ${mediaQuery.md`
    padding: 0 var(--kiwi-spacing-2);
  `}
  ${mediaQuery.xl`
    padding: 0 var(--kiwi-spacing-3) 0 var(--kiwi-spacing-5);
  `}
`;

export const DocumentListWrapper = styled.div``;

export const Wrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
`;
export const Header = styled.div`
  position: sticky;
  top: 16px;
  z-index: 3;
  &:before {
    content: '';
    position: absolute;
    background-color: #fff;
    z-index: -2;
    width: calc(100% + 160px);
    height: calc(100% + 16px);
    top: -16px;
    left: -80px;
  }

  ${mediaQuery.xl`
    top: 32px;
    margin: 0 -${DROPZONE_PADDING}px;
    padding: 0 ${DROPZONE_PADDING}px;
    &:after {
      content: '';
      position: absolute;
      left: 0;
      top: -${DROPZONE_PADDING}px;
      bottom: 0;
      right: 0;
      z-index: -1;
      border: 1px solid transparent;
      border-bottom: none;
      box-sizing: border-box;
      transition: background-color 0.3s ease, border-color 0.3s ease;
      border-radius: var(--border-radius-primary) var(--border-radius-primary) 0 0;
      ${isHighlight`
        background-color: ${Colors.PRIMARY_10};
        border-color: ${Colors.PRIMARY_80};
      `}
    }
    &:before {
      transition: background-color 0.3s ease;
      height: calc(100% + 32px);
      top: -32px;
      ${({ $isWindowDragging, $isMultipleSelecting }) =>
        $isWindowDragging &&
        !$isMultipleSelecting &&
        `
        left: 0;
        width: 100%;
      `}
    }
  `}
`;

export const HeaderReskin = styled.div`
  min-width: 0;
  position: sticky;
  top: 0;
  z-index: 4;
  background-color: var(--kiwi-colors-surface-surface-container-lowest);
  padding: 0 var(--kiwi-spacing-3);
  ${mediaQuery.xl`
    padding-right: var(--kiwi-spacing-3);
    padding-left: var(--kiwi-spacing-4);
    &:after {
      content: '';
      position: absolute;
      left: 0;
      top: -${DROPZONE_PADDING}px;
      bottom: 0;
      right: 0;
      z-index: -1;
      border: 1px solid transparent;
      border-bottom: none;
      box-sizing: border-box;
      transition: background-color 0.3s ease, border-color 0.3s ease;
      border-radius: var(--border-radius-primary) var(--border-radius-primary) 0 0;
      ${isHighlight`
        background-color: ${Colors.PRIMARY_10};
        border-color: ${Colors.PRIMARY_80};
      `}
    }
  `}
`;

export const ListContainer = styled.div`
  flex-wrap: wrap;
  display: block;
`;

export const Container = styled.div`
  transition: padding 0.3s ease;
  ${({ $isMultipleSelecting }) =>
    $isMultipleSelecting &&
    `
    padding-bottom: 64px;
  `}
  ${mediaQuery.md`
    padding-bottom: 0;
  `}
  ${stretchChildren};
  ${stretchParent};
`;

export const ContainerReskin = styled.div`
  transition: padding 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const VirtualizedList = styled(BaseVirtualizedList)`
  overflow: unset !important;
  &[data-reskin="true"] {
    padding-bottom: var(--kiwi-spacing-1-5);
  }
`;

export const SkeletonContainer = styled.div`
  flex-grow: 1;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--color-neutral-20);
  display: ${({ $isListLayout }) => ($isListLayout ? 'block' : 'none')};
  ${({ $empty }) =>
    $empty &&
    `
    display: none;
  `}
`;

export const DividerReskin = styled.div`
  width: 100%;
  height: var(--kiwi-spacing-0-125);
  background-color: var(--kiwi-colors-surface-surface-container-high);
  display: ${({ $isListLayout }) => ($isListLayout ? 'block' : 'none')};
  ${({ $empty }) =>
    $empty &&
    `
    display: none;
  `}
`;

export const DividerWrapper = styled.div`
  padding: 0px var(--kiwi-spacing-1) 0px var(--kiwi-spacing-1);
`;
