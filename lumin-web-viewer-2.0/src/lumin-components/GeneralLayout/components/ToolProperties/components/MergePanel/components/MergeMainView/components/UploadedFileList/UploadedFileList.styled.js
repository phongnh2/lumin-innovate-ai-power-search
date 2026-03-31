import styled, { css } from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const FileItem = styled.div`
  position: relative;
  padding: ${spacings.le_gap_1}px;
  margin-bottom: ${spacings.le_gap_1}px;
  border: 1px solid ${({ theme }) => theme.le_main_outline_variant};
  height: 47px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  background-color: var(--kiwi-colors-surface-surface);

  ${({ $notDragging, $dragging, $draggedOver, theme }) => `
    

  &:hover {
    &::after {
      content: '';
      position: absolute;
      height: 2px;
      bottom: -5px;
      left: 0px;
      right: 0px;
      background: ${$draggedOver ? theme.le_main_outline_variant : 'transparent'};
      display: block;
      z-index: 2;
      border-radius: 99999px;
    }
  }

    ${
      $notDragging &&
      `
            transform: translate(0px, 0px) !important;
            pointer-events: all !important;
        `
    }

    ${
      $dragging &&
      `
            opacity: 0.7 !important;
        `
    }
`}
`;

export const Thumbnail = styled.img`
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.le_main_outline_variant};
  object-fit: cover;
`;

export const FileDesc = styled.div`
  /* font-size: 12px;
      font-weight: 375;
      line-height: 16px;

      @include themify {
        color: themed("textColorLighter");
      } */

  padding-left: 8px;
  padding-right: 8px;
  width: calc(100% - 60px);
  text-overflow: ellipsis;
  overflow: hidden;
  display: box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
`;

const getFileNameColor = ({ theme, error, loading }) => {
  if (loading) {
    return theme.le_main_on_surface_variant;
  }
  if (error) {
    return theme.le_disable_on_container;
  }
  return theme.le_main_on_surface;
};

export const FileName = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${{ ...typographies.le_label_medium }}
  ${({ theme, $error, $loading }) => css`
    color: ${getFileNameColor({ theme, error: $error, loading: $loading })};
  `}
`;

export const FileSize = styled.div`
  ${{ ...typographies.le_label_small }}
  ${({ theme, $withError }) => `
    color: ${$withError ? theme.le_error_error : theme.le_main_on_surface_variant};
  `}
`;

export const UploadingLabel = styled.span`
  ${{ ...typographies.le_label_small }}
  margin-right: ${spacings.le_gap_0_5}px;
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
  `}
`;

export const UploadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ProgressWrapper = styled.div`
  flex-grow: 1;
`;

export const FileList = styled.div`
  padding: 0 ${spacings.le_gap_2}px;
  margin-bottom: ${spacings.le_gap_1}px;
  border-bottom: 1px solid transparent;
  position: relative;

  &::after {
    position: absolute;
    content: '';
    bottom: -1px;
    left: 16px;
    right: 16px;
    height: 1px;
    ${({ theme }) => `
      background-color: ${theme.le_main_outline_variant}
    `}
  }
`;

export const Spacing = styled.div`
  width: 100%;
  margin-bottom: ${spacings.le_gap_1}px;
`;

export const DummyItem = styled.div`
  height: 47px;
  border-radius: 8px;
  margin-bottom: ${spacings.le_gap_1}px;

  ${({ theme }) => `
      background-color: ${theme.le_disable_container}
    `}
`;

export const HandleWrapper = styled.div`
  margin-right: ${spacings.le_gap_0_5}px;
`;
