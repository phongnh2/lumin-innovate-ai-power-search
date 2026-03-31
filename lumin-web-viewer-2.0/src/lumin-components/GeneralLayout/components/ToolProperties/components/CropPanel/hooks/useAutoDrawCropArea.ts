/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { PAGE_RANGE_OPTIONS } from '@new-ui/components/PageRangeSelection/constants';
import { PageRangeType } from '@new-ui/components/PageRangeSelection/types';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { PageToolViewMode } from 'constants/documentConstants';

import { CropDimensionType } from '../types';
import { getCropPageNumbers } from '../utils/getCropPageNumbers';
import { mouseTriggerCreateCropArea } from '../utils/mouseTriggerCreateCropArea';

interface UseAutoDrawCropAreaProps {
  pageRangeValue: string;
  cropMode: PageRangeType;
  cropDimension: CropDimensionType;
}

const DEFAULT_MARGIN = 10;

export const useAutoDrawCropArea = (props: UseAutoDrawCropAreaProps) => {
  const { cropDimension, cropMode, pageRangeValue } = props;
  const dispatch = useDispatch();
  const pageEditDisplayMode = useShallowSelector(selectors.pageEditDisplayMode);
  const toolPropertiesValue = useShallowSelector(selectors.toolPropertiesValue);
  const previousDisplayMode = useRef(null);

  const normalizeDocumentView = () => {
    const viewportRegionRect = core.docViewer.getViewportRegionRect(core.getCurrentPage()) as { x1: number };
    if (viewportRegionRect && viewportRegionRect.x1 > 0) {
      core.docViewer.setFitMode(core.docViewer.FitMode.FitPage);
    }
  };

  useEffect(() => {
    if (pageEditDisplayMode !== PageToolViewMode.LIST) {
      return;
    }

    core.getScrollViewElement().scrollTop = 0;
    normalizeDocumentView();
    const { docViewer, disableReadOnlyMode } = core;
    const cropCreateTool = new window.Core.Tools.CropCreateTool(docViewer);

    disableReadOnlyMode();
    docViewer.setToolMode(cropCreateTool);

    const pageNumber = 1;
    const pageInfo = docViewer.getDocument().getPageInfo(pageNumber);
    let startPoint: { x: number; y: number };
    let endPoint: { x: number; y: number };

    if (previousDisplayMode.current === null) {
      startPoint = { x: DEFAULT_MARGIN, y: DEFAULT_MARGIN };
      endPoint = { x: pageInfo.width - DEFAULT_MARGIN, y: pageInfo.height - DEFAULT_MARGIN };
    } else {
      const { left, top, right, bottom } = cropDimension;
      startPoint = { x: left, y: top };
      endPoint = { x: pageInfo.width - right, y: pageInfo.height - bottom };
    }

    mouseTriggerCreateCropArea({ cropCreateTool, pageNumber, startPoint, endPoint });
    previousDisplayMode.current = pageEditDisplayMode;
  }, [pageEditDisplayMode]);

  useEffect(() => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.CROP && pageEditDisplayMode === PageToolViewMode.GRID) {
      dispatch(actions.changePageEditDisplayMode(PageToolViewMode.LIST));
    }
  }, [toolPropertiesValue]);

  /**
   * This hook is used to set the current page when switching from GRID to LIST mode at Crop tool
   * Based on the current page range value (current page or specific pages), we will set the current page
   */
  useEffect(() => {
    if (previousDisplayMode.current !== PageToolViewMode.GRID && pageEditDisplayMode !== PageToolViewMode.LIST) {
      return;
    }

    if (cropMode !== PAGE_RANGE_OPTIONS.ALL_PAGES && pageRangeValue.length) {
      const cropPageNumbers: number[] = getCropPageNumbers(cropMode, pageRangeValue, core.getTotalPages());
      core.setCurrentPage(cropPageNumbers[0]);
    }
  }, [cropMode, pageRangeValue, pageEditDisplayMode]);
};
