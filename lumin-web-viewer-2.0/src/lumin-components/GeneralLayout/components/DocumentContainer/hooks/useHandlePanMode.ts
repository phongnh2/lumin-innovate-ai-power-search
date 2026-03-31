import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import { useLatestRef } from 'hooks';

import { fullScreenSelectors } from 'features/FullScreen/slice';

export const useHandlePanMode = () => {
  const isInPresenterMode = useSelector(selectors.isInPresenterMode);
  const defaultZoom = useSelector(fullScreenSelectors.defaultZoom);
  const defaultZoomRef = useLatestRef(defaultZoom);

  const isPanMode = useCallback(() => defaultZoomRef.current !== core.getZoom(), [defaultZoomRef]);

  useEffect(() => {
    if (!isInPresenterMode) {
      core.setToolMode(Core.Tools.ToolNames.TEXT_SELECT);
      return undefined;
    }
    const onZoomUpdated = () => {
      if (defaultZoom === core.getZoom()) {
        core.setToolMode(Core.Tools.ToolNames.TEXT_SELECT);
      } else {
        core.setToolMode(Core.Tools.ToolNames.PAN);
      }
    };
    core.addEventListener('zoomUpdated', onZoomUpdated);

    return () => {
      core.removeEventListener('zoomUpdated', onZoomUpdated);
    };
  }, [defaultZoom, isInPresenterMode]);

  return { isPanMode };
};
