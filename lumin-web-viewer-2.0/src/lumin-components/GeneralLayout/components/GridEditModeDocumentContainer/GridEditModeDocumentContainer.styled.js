import styled from 'styled-components';

import * as DocumentContainerStyled from 'lumin-components/GeneralLayout/components/DocumentContainer/DocumentContainer.styled';

import { spacings } from 'constants/styles/editor';

export const GridWrapper = styled(DocumentContainerStyled.DocumentContainerWrapper)`
  padding: 0 2px;
  width: 100%;
  box-sizing: border-box;
`;

export const GridViewThumbnailContainer = styled.div`
  padding: 8px;
  width: 100%;
  height: 100%;
  &[data-disabled='true'] {
    opacity: 0.5;
    pointer-events: none;
  }
`;

export const SkeletonContainer = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
  gap: ${spacings.le_gap_2}px;
  padding: ${spacings.le_gap_1}px ${spacings.le_gap_1}px 0 ${spacings.le_gap_1}px;
`;

export const GridInnerWrapper = styled.div`
  overflow: auto;
  z-index: 10;
  position: relative;
  height: ${({ $bannerHeight }) => `calc(100% - ${$bannerHeight}px)`}!important;
  width: 100% !important;
  transition: var(--editor-transition);
  user-select: none;
  overflow-x: hidden;
  border-radius: ${({ $bannerHeight }) => ($bannerHeight ? '0' : '8px 8px 0 0')};
  background-color: var(--kiwi-colors-surface-surface);
`;

export const BannerWrapper = styled.div`
  border-radius: 8px 8px 0 0;
`;

export const GridSkeleton = styled.div`
  width: 100%;
  height: calc(100% - 44px);
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--kiwi-colors-surface-surface-container);
`;

export const GridSkeletonContainer = styled.div`
  padding: 8px;
`;
