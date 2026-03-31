import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { ToolName } from 'core/type';

import core from 'core';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { useFreeTextToolbarVisibility } from 'features/FreeTextToolbar/hooks/useFreeTextToolbarVisibility';
import { measureToolSelectors } from 'features/MeasureTool/slices';

import { TOOLS_NAME } from 'constants/toolsName';

export const useFloatingToolbarActive = () => {
  const [shouldShowFloatingToolbar, setShouldShowFloatingToolbar] = useState(false);
  const activeToolName = useShallowSelector(selectors.getActiveToolName);
  const isMeasurementToolActive = useSelector(measureToolSelectors.isActive);
  const isPreviewOriginalVersionMode = useSelector(selectors.isPreviewOriginalVersionMode);
  const isRedactionToolActive = activeToolName === TOOLS_NAME.REDACTION;

  const { style, annotation, isFreeTextToolbarActive } = useFreeTextToolbarVisibility();

  const isFloatingToolsActive = isRedactionToolActive || isMeasurementToolActive || isFreeTextToolbarActive;

  useEffect(() => {
    setShouldShowFloatingToolbar(!isPreviewOriginalVersionMode && isFloatingToolsActive);
  }, [isPreviewOriginalVersionMode, isFloatingToolsActive]);

  const onClose = useCallback(() => {
    core.setToolMode(TOOLS_NAME.EDIT as ToolName);
    setShouldShowFloatingToolbar(false);
  }, []);

  return {
    style,
    annotation,
    isRedactionToolActive,
    isMeasurementToolActive,
    isFreeTextToolbarActive,
    shouldShowFloatingToolbar,
    onClose,
  };
};
