import styled from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const ThumbContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-bottom: 8px;
  height: 100%;
  width: 100%;

  > canvas {
    object-fit: contain;
    height: 100% !important;
    width: 100% !important;
    background-color: transparent !important;
  }

  .page-image {
    border-radius: 1px;
    border: 1px solid transparent;
    transition: all 0.1s ease;
  }

  .annotation-image {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
  }
`;

export const ThumbnailPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden !important;

  .virtualized-thumbnails-container {
    flex: 1;
    height: 100%;
  }

  .row {
    display: flex;
    justify-content: center;
    &.disabled [draggable='false'] {
      cursor: default !important;
    }
  }

  .thumbnailPlaceholder {
    margin: 0;
  }

  .columnsOfThumbnails {
    .Thumbnail {
      display: inline-flex;
    }

    .thumbnailPlaceholder {
      height: 180px;
      display: inline-flex;
    }
  }
`;

export const ThumbnailLabel = styled.div`
  ${{ ...typographies.le_label_medium }};
  ${({ theme }) => `
      color: ${theme.le_main_on_surface_variant};
    `}
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 8px;
`;

export const ThumbnailOverlayMask = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;

  z-index: 1;
  opacity: 0;
  ${({ theme }) => `
      background-color: ${theme.le_state_layer_on_surface_variant_hovered};
    `}
`;

const BaseButtonWrapper = styled.div`
  overflow: hidden;
  ${({ theme }) => `
      background-color: ${theme.le_main_surface_container_lowest};
      border-radius: 8px;
    `}
  >button {
    transform: scale(1.02);
  }
`;

export const ThumbnailOverlayBtns = styled.div`
  z-index: 2;
  opacity: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: ${spacings.le_gap_2}px;
  justify-content: center;
  width: 100%;
`;

export const ThumbnailOverlayBtnWrapper = styled(BaseButtonWrapper)``;

export const ThumbnailOverlayMenu = styled(BaseButtonWrapper)`
  position: absolute;
  z-index: 2;
  opacity: 0;
  top: 4px;
  right: 4px;
  ${({ theme, $isThumbnailActive }) => `
      border: 1px solid ${theme.le_main_outline_variant};
      opacity: ${$isThumbnailActive ? 1 : 0};
    `}
`;

export const ThumbnailOverlayWrapper = styled.div`
  position: relative;
`;

export const ThumbnailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: grab;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  margin-top: 8px;
  &[data-disabled='true'] {
    cursor: default;
  }

  &.active {
    ${({ theme }) => `
      background-color: ${theme.le_main_surface_container_high};
      ${ThumbContainer} {
        .page-image {
          border-color: ${theme.le_main_primary};
        }
      }
    `}
  }
`;

export const ThumbnailOuterWrapper = styled.div`
  &:hover {
    ${ThumbnailOverlayMask}, ${ThumbnailOverlayBtns}, ${ThumbnailOverlayMenu} {
      opacity: 1;
    }
  }
`;

export const ThumbnailContentWrapper = styled.div`
  margin-top: 8px;
  ${({ $isPortray }) =>
    $isPortray
      ? `
        height: 128px; 
        width: 96px;
      `
      : `
        height: 96px; 
        width: 128px;
  `}
`;

export const ModalContent = styled.div`
  ${{ ...typographies.le_body_medium }};
  ${({ theme }) =>
    `
      color: ${theme.le_main_on_surface_variant};
    `}
`;
