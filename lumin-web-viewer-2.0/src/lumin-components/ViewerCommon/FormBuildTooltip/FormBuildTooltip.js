import inRange from 'lodash/inRange';
import rafSchd from 'raf-schd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import DataElements from 'constants/dataElement';
import ToolNames from 'constants/toolsName';

import { HorizontalLine, VerticalLine } from './FormBuildTooltip.styled';

const FormBuildTooltip = () => {
  const [activeToolName, shouldShowPreview] = useSelector((state) => [
    selectors.getActiveToolName(state),
    selectors.isElementOpen(state, DataElements.FORM_BUILD_TOOLTIP),
  ]);

  const [hide, setHide] = useState(true);
  const [overlayPosition, setOverlayPosition] = useState({
    left: 0,
    top: 0,
  });

  const [pageInfo, setPageInfo] = useState({
    left: 0,
    top: 0,
    height: 0,
    width: 0,
    bottom: 0,
    right: 0,
  });
  const [isMousePositionInPage, setMousePositionInPage] = useState(false);
  const isSelectedAnnotation = core.getSelectedAnnotations().length > 0;
  const isFormBuildToolActive = [
    ToolNames.TEXT_FIELD,
    ToolNames.CHECK_BOX,
    ToolNames.RADIO,
    ToolNames.SIGNATURE_FIELD,
  ].includes(activeToolName);

  const fitWindowSize = (e) => {
    const left = e.clientX;
    const top = e.clientY;
    return { left, top };
  };

  useEffect(() => {
    setHide(!isMousePositionInPage || !isFormBuildToolActive || isSelectedAnnotation || !shouldShowPreview);
  }, [isMousePositionInPage, isFormBuildToolActive, shouldShowPreview, isSelectedAnnotation]);

  const onMouseMove = (e) => {
    const { left, top } = fitWindowSize(e);
    setOverlayPosition({ left, top });
    const { pageNumber } = core.getViewerCoordinatesFromMouseEvent(e);
    const pageContainer = document.getElementById(`pageContainer${pageNumber}`);
    const currentPageInfo = pageContainer.getBoundingClientRect();
    setPageInfo(currentPageInfo);
    const isMouseInPage =
      inRange(left, currentPageInfo.left, currentPageInfo.right) &&
      inRange(top, currentPageInfo.top, currentPageInfo.bottom);
    setMousePositionInPage(isMouseInPage);
  };

  useEffect(() => {
    const onMouseMoveThrottle = rafSchd(onMouseMove);

    if (isFormBuildToolActive && shouldShowPreview) {
      core.docViewer.addEventListener('mouseMove', onMouseMoveThrottle);
      return () => {
        core.docViewer.removeEventListener('mouseMove', onMouseMoveThrottle);
      };
    }
  }, [isFormBuildToolActive, shouldShowPreview]);

  if (!core.getFormFieldCreationManager().isInFormFieldCreationMode()) {
    return null;
  }
  return (
    <>
      <HorizontalLine hide={hide} style={{ left: pageInfo.left, top: overlayPosition.top, width: pageInfo.width }} />
      <VerticalLine hide={hide} style={{ top: pageInfo.top, left: overlayPosition.left, height: pageInfo.height }} />
    </>
  );
};

export default React.memo(FormBuildTooltip);
