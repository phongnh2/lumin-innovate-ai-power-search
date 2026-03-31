import { useHotkeys } from '@mantine/hooks';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useKey } from 'react-use';

import core from 'core';
import selectors from 'selectors';

import { useLatestRef } from 'hooks/useLatestRef';

import { fullScreenSelectors } from 'features/FullScreen/slice';

import { useHandlePanMode } from './useHandlePanMode';
import useZoomDocument, { ZoomTypes } from '../../PageNavigation/hook/useZoomDocument';

export const usePresenterModeHandlers = (containerRef: React.RefObject<HTMLDivElement>) => {
  const isInPresenterMode = useSelector(selectors.isInPresenterMode);
  const isInPresenterModeRef = useLatestRef(isInPresenterMode);
  const { isPanMode } = useHandlePanMode();
  const defaultZoom = useSelector(fullScreenSelectors.defaultZoom);
  const defaultZoomRef = useLatestRef(defaultZoom);
  const { onZoomByAction } = useZoomDocument();

  useHotkeys([
    [
      'mod+=',
      (e) => {
        e.preventDefault();
        onZoomByAction(ZoomTypes.ZOOM_IN);
      },
    ],
    [
      'mod+-',
      (e) => {
        e.preventDefault();
        onZoomByAction(ZoomTypes.ZOOM_OUT);
      },
    ],
  ]);

  const resetZoom = useCallback(
    (e: KeyboardEvent) => {
      if (!isInPresenterModeRef.current) {
        return;
      }
      if (e.metaKey || e.ctrlKey) {
        core.setZoomLevel(defaultZoomRef.current);
      }
    },
    [defaultZoomRef, isInPresenterModeRef]
  );

  useKey('0', resetZoom);

  useEffect(() => {
    const onContainerClick = () => {
      if (isPanMode()) {
        return;
      }
      core.setCurrentPage(core.getCurrentPage() + 1);
    };

    if (containerRef.current && isInPresenterMode) {
      containerRef.current.addEventListener('click', onContainerClick);
    }
    return () => {
      containerRef.current?.removeEventListener('click', onContainerClick);
    };
  }, [containerRef, isInPresenterMode, isPanMode]);

  return { isPanMode };
};
