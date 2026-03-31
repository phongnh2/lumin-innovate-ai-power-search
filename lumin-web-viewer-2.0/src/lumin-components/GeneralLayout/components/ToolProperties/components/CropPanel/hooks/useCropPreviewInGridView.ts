import debounce from 'lodash/debounce';
import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import { PAGE_RANGE_OPTIONS } from 'lumin-components/GeneralLayout/components/PageRangeSelection/constants';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { drawCropPreviewCanvas } from 'helpers/cropPreview';

import { PageToolViewMode } from 'constants/documentConstants';
import { TIMEOUT } from 'constants/lumin-common';

import { CropDimensionType } from '../types';

interface CropPreviewInfo {
  pageNum: number;
  width: number;
  height: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export const useCropPreviewInGridView = (cropPanelState: {
  cropDimension: CropDimensionType;
  cropMode: string;
  pageRangeValue: string;
  isPageRangeValid: boolean;
}) => {
  const thumbs = useSelector(selectors.getThumbs);
  const pageEditDisplayMode = useShallowSelector(selectors.pageEditDisplayMode);
  const previousDisplayMode = useRef(pageEditDisplayMode);

  const { cropDimension, cropMode, pageRangeValue, isPageRangeValid } = cropPanelState;

  const clearAllCropPreviews = useCallback(() => {
    // Clear all existing crop previews
    thumbs.forEach((thumb: Record<string, unknown>) => {
      if (thumb?.id) {
        const canvas = document.getElementById(`canvas-${thumb.id as string}`) as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      }
    });
  }, [thumbs]);

  const showCropPreviewInGridView = useCallback(
    (props: CropPreviewInfo) => {
      const { pageNum, width, height, top, left, bottom, right } = props;
      const thumb = thumbs[pageNum - 1];
      if (!thumb?.id) {
        return;
      }

      const cropPreviewTag = document.getElementById(`canvas-${thumb.id as string}`) as HTMLCanvasElement;
      if (!cropPreviewTag) {
        return;
      }

      const thumbWidth = Number(thumb.width);
      const thumbHeight = Number(thumb.height);

      const coffientWidth = thumbWidth / width;
      const coffientHeight = thumbHeight / height;

      cropPreviewTag.width = thumbWidth;
      cropPreviewTag.height = thumbHeight;

      const canvas = document.getElementById(`canvas-${thumb.id as string}`) as HTMLCanvasElement;
      const ctx = canvas?.getContext('2d');

      if (!ctx) {
        return;
      }

      // Clear previous preview
      ctx.clearRect(0, 0, thumbWidth, thumbHeight);

      drawCropPreviewCanvas({
        canvas,
        coffientWidth,
        coffientHeight,
        width,
        height,
        top,
        left,
        bottom,
        right,
        cropPreviewBg: 'rgba(0, 0, 0, 0.3)',
        cropPreviewStroke: '#C4F0FD',
      });
    },
    [thumbs]
  );

  const debouncedShowCropPreview = useCallback(
    debounce((cropPreviewInfos: Array<CropPreviewInfo>) => {
      // Clear all existing previews first
      clearAllCropPreviews();

      // Show new previews
      cropPreviewInfos.forEach((cropPreviewInfo) => {
        showCropPreviewInGridView(cropPreviewInfo);
      });
    }, TIMEOUT.GRID_VIEW_SHOW_CROP_PREVIEW || 50),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showCropPreviewInGridView, clearAllCropPreviews]
  );

  const triggerGridCropPreview = useCallback(() => {
    const isValidPageRange =
      isPageRangeValid || cropMode === PAGE_RANGE_OPTIONS.ALL_PAGES || cropMode === PAGE_RANGE_OPTIONS.CURRENT_PAGE;

    if (!isValidPageRange) {
      return;
    }

    const totalPages = core.getTotalPages();
    let pagesToPreview: number[] = [];

    if (cropMode === PAGE_RANGE_OPTIONS.ALL_PAGES) {
      pagesToPreview = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (pageRangeValue) {
      const pageNumbers = pageRangeValue
        .split(/[,-]/)
        .map((p) => parseInt(p.trim(), 10))
        .filter((p) => !Number.isNaN(p) && p <= totalPages && p > 0);
      pagesToPreview = pageNumbers;
    }

    if (pagesToPreview.length === 0) {
      return;
    }

    const { top, left, bottom, right } = cropDimension;
    const cropPreviewInfos: Array<CropPreviewInfo> = [];

    pagesToPreview.forEach((pageNum) => {
      const { width, height } = core.getPageInfo(pageNum);

      // Validate crop dimensions for this specific page
      const isVerticalCropLongerThanHeight = top + bottom > height - 100;
      const isHorizontalCropLongerThanWidth = left + right > width - 100;

      if (isVerticalCropLongerThanHeight || isHorizontalCropLongerThanWidth) {
        return;
      }

      cropPreviewInfos.push({
        pageNum,
        top,
        left,
        bottom,
        right,
        width,
        height,
      });
    });

    if (cropPreviewInfos.length > 0) {
      debouncedShowCropPreview(cropPreviewInfos);
    }
  }, [cropMode, pageRangeValue, isPageRangeValid, cropDimension, debouncedShowCropPreview]);

  useEffect(() => {
    const isGridMode = pageEditDisplayMode === PageToolViewMode.GRID;
    const hasThumbs = thumbs && thumbs.length > 0;

    if (!isGridMode || !hasThumbs) {
      previousDisplayMode.current = pageEditDisplayMode;
      return;
    }

    const changedToGridMode = previousDisplayMode.current !== PageToolViewMode.GRID;
    if (changedToGridMode) {
      triggerGridCropPreview();
      previousDisplayMode.current = pageEditDisplayMode;
      return;
    }

    if (cropDimension) {
      triggerGridCropPreview();
      previousDisplayMode.current = pageEditDisplayMode;
    }
  }, [pageEditDisplayMode, thumbs, cropDimension, triggerGridCropPreview]);
};
