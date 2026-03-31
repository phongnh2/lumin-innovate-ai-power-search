import rafSchd from 'raf-schd';
import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';

import core from 'core';
import selectors from 'selectors';

import { useTranslation } from 'hooks';
import useShallowSelector from 'hooks/useShallowSelector';

import { resizeRubberStampPreview } from 'features/RubberStamp/utils/rubberStampResizer';

import ToolNames from 'constants/toolsName';

import {
  PlaceMultipleTimesTooltipContent,
  PlaceMultipleTimesTooltipWrapper,
  Theme,
} from './PlaceMultipleTimesTooltip.styled';

const MARGIN = 40;

const TOOLS_SUPPORT_PLACING_MULTIPLE_TIMES = [ToolNames.SIGNATURE, ToolNames.RUBBER_STAMP];

const PlaceMultipleTimesTooltip = () => {
  const [activeToolName, themeMode, isPlacingMultipleSignatures, isPlacingMultipleRubberStamp] = useShallowSelector(
    (state) => [
      selectors.getActiveToolName(state),
      selectors.getThemeMode(state),
      selectors.isPlacingMultipleSignatures(state),
      selectors.isPlacingMultipleRubberStamp(state),
    ]
  );

  const themeProvider = Theme[themeMode];

  const overlayRef = useRef(null);
  const toolRef = useRef(null);
  const [isMouseEnter, setMouseEnter] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({
    left: 0,
    top: 0,
  });

  const { t } = useTranslation();

  const fitWindowSize = (e) => {
    const overlayRect = overlayRef.current.getBoundingClientRect();
    let margin = MARGIN;
    if (toolRef.current) {
      // Calculate height of the annotation before relocating textOverlay
      let annotRectHeight = toolRef.current.annot?.getRect().y2 ?? 0;
      const rubberStampPreviewDOM = document.getElementById('rubberstamp-preview');
      const signaturePreviewEl = document.getElementById('signature-preview');
      if (activeToolName === ToolNames.RUBBER_STAMP && rubberStampPreviewDOM) {
        annotRectHeight = rubberStampPreviewDOM.offsetHeight;
        resizeRubberStampPreview({ rubberStampPreviewElement: rubberStampPreviewDOM });
      }
      if (activeToolName === ToolNames.SIGNATURE && signaturePreviewEl) {
        annotRectHeight = signaturePreviewEl.offsetHeight;
      }
      margin = (annotRectHeight / 2) + MARGIN;
    }

    const left = e.clientX - overlayRect.width / 2;
    const top = e.clientY - margin;
    return { left, top };
  };

  const isValidToolToPlace = TOOLS_SUPPORT_PLACING_MULTIPLE_TIMES.includes(activeToolName);
  const isEnabledStampMultiPlacing = activeToolName === ToolNames.RUBBER_STAMP && isPlacingMultipleRubberStamp;
  const isEnabledSignatureMultiPlacing = activeToolName === ToolNames.SIGNATURE && isPlacingMultipleSignatures;
  const hide = !isMouseEnter || !isValidToolToPlace || (!isEnabledStampMultiPlacing && !isEnabledSignatureMultiPlacing);

  const onMouseEnter = () => {
    setMouseEnter(true);
  };

  const onMouseLeave = () => {
    setMouseEnter(false);
  };

  const onMouseMove = (e) => {
    const { left, top } = fitWindowSize(e);
    setOverlayPosition({ left, top });
  };

  useEffect(() => {
    const onMouseMoveThrottle = rafSchd(onMouseMove);

    if (isValidToolToPlace) {
      toolRef.current = core.getTool(activeToolName);

      core.docViewer.addEventListener('mouseLeave', onMouseLeave);
      core.docViewer.addEventListener('mouseEnter', onMouseEnter);
      core.docViewer.addEventListener('mouseMove', onMouseMoveThrottle);
      return () => {
        core.docViewer.removeEventListener('mouseMove', onMouseMoveThrottle);
        core.docViewer.removeEventListener('mouseEnter', onMouseEnter);
        core.docViewer.removeEventListener('mouseLeave', onMouseLeave);
      };
    }
  }, [activeToolName, isValidToolToPlace]);

  return (
    <ThemeProvider theme={themeProvider}>
      <PlaceMultipleTimesTooltipWrapper ref={overlayRef} hide={hide} style={{ ...overlayPosition }}>
        <PlaceMultipleTimesTooltipContent>{t('viewer.signatureTooltip.content')}</PlaceMultipleTimesTooltipContent>
      </PlaceMultipleTimesTooltipWrapper>
    </ThemeProvider>
  );
};

export default PlaceMultipleTimesTooltip;
