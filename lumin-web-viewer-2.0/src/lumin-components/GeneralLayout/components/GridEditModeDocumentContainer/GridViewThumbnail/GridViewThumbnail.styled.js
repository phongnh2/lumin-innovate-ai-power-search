import styled from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const GridViewThumbnail = styled.div`
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  text-align: center;
  display: flex;
  width: 100%;
  height: 100%;
`;

export const GridViewThumbnailFrameOuter = styled.div`
  flex-grow: 1;
  margin: 0;
  padding: 0;
  position: relative;
  width: 100%;
  height: 100%;
`;

export const GridViewThumbnailFrameInner = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 8px;
`;

export const BtnsWrapper = styled.div`
  display: flex;
  gap: ${spacings.le_gap_2}px;
`;

export const ButtonPaper = styled.div`
  background-color: ${({ theme }) => theme.le_main_surface_container_lowest};
  border-radius: 8px;
`;

const BaseOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Overlay = styled(BaseOverlay)`
  visibility: hidden;
  opacity: 0;
  z-index: 10;
  cursor: move;
  background-color: ${({ theme }) => theme.le_state_layer_on_surface_variant_hovered};
`;

export const BlockedOverlay = styled(BaseOverlay)`
  visibility: visible;
  opacity: 0.38;
  z-index: 10;
  cursor: not-allowed;
`;

export const ContainerInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  .thumbnailCanvas {
    position: relative;
    height: 100%;
    width: 100%;

    &.addedByMerged {
      border: 2px solid var(--color-primary-50);
    }

    &.isDragging:before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 11;
      pointer-events: none;
      background-color: var(--kiwi-colors-surface-surface-container);
    }
  }
`;

export const Container = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.le_main_outline_variant};
  width: 100%;
  height: 100%;

  &:hover {
    ${Overlay} {
      visibility: visible;
      opacity: 1;
    }
  }

  &.blocked-page {
    opacity: 0.38;
  }
  &.thumb-rotate-left {
    transform: rotate(-90deg);
    ${BtnsWrapper} {
      transform: rotate(90deg);
    }
  }
  &.thumb-rotate-right {
    transform: rotate(90deg);
    ${BtnsWrapper} {
      transform: rotate(-90deg);
    }
  }
  &.thumb-rotate-bottom {
    transform: rotate(180deg);
    ${BtnsWrapper} {
      transform: rotate(-180deg);
    }
  }

  img {
    object-fit: contain;
    border: none !important;
    width: 100%;
    height: 100%;
  }

  &.annotation-image {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
  }
`;

export const PageNumber = styled.div`
  ${{ ...typographies.le_body_medium }}
  padding-bottom: 16px;
  color: ${({ theme }) => theme.le_main_on_surface_variant}!important;

  &.isOverlay {
    visibility: hidden;
  }

  &.isDragging {
    opacity: var(--kiwi-opacity-disabled-on-container);
  }
`;

export const Canvas = styled.canvas`
  display: inline-block;
  position: absolute;
  z-index: 1;
`;
