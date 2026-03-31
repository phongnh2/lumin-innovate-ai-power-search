import throttle from 'lodash/throttle';
import rafSchd from 'raf-schd';
import { RefObject, useCallback } from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import { useLatestRef } from 'hooks/useLatestRef';

import getNumberOfPagesToNavigate from 'helpers/getNumberOfPagesToNavigate';
import setCurrentPage from 'helpers/setCurrentPage';
import { getZoomFactorForWheel } from 'helpers/zoom';

import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';
import { fullScreenSelectors } from 'features/FullScreen/slice';

const THROTTLE_NAVIGATE_PAGE = 300;

/**
 * Custom hook to handle document wheel events for zooming and page navigation
 * @param containerRef - Reference to the document container element
 * @param allowPageNavigation - Whether page navigation is allowed
 * @returns Function to setup wheel event handler
 */
const useDocumentWheel = (containerRef: RefObject<HTMLDivElement>, allowPageNavigation = true) => {
  const defaultPresentationZoom = useSelector(fullScreenSelectors.defaultZoom);
  const defaultPresentationZoomRef = useLatestRef(defaultPresentationZoom);
  const isInPresenterMode = useSelector(selectors.isInPresenterMode);
  const isAiProcessing = useSelector(editorChatBotSelectors.getIsAiProcessing);
  const isAiProcessingRef = useLatestRef(isAiProcessing);
  const isInPresenterModeRef = useLatestRef(isInPresenterMode);

  const pageUp = useCallback(
    (currentPage: number): void => {
      const { scrollHeight, clientHeight } = containerRef.current;
      setCurrentPage(currentPage - getNumberOfPagesToNavigate());
      containerRef.current.scrollTop = scrollHeight - clientHeight;
    },
    [containerRef]
  );

  const pageDown = useCallback((currentPage: number): void => {
    setCurrentPage(currentPage + (getNumberOfPagesToNavigate() as number));
  }, []);

  const wheelToNavigatePages = useCallback(
    throttle(
      (e: WheelEvent): void => {
        if (!core.getDocument()) {
          return;
        }

        const totalPages = core.getTotalPages();
        const currentPage = core.getCurrentPage();
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const reachedTop = scrollTop === 0;
        const reachedBottom = Math.abs(scrollTop + clientHeight - scrollHeight) <= 1;

        // depending on the track pad used (see this on MacBooks), deltaY can be between -1 and 1 when doing horizontal scrolling which cause page to change
        const scrollingUp = e.deltaY < 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX);
        const scrollingDown = e.deltaY > 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX);

        if (scrollingUp && reachedTop && currentPage > 1) {
          pageUp(currentPage);
        } else if (scrollingDown && reachedBottom && currentPage < totalPages) {
          pageDown(currentPage);
        }
      },
      THROTTLE_NAVIGATE_PAGE,
      { trailing: false }
    ),
    [pageUp, pageDown, containerRef]
  );

  const handlePresenterModeZoom = useCallback(
    (newZoomFactor: number): { handled: boolean; zoomApplied: boolean } => {
      if (!isInPresenterModeRef.current) {
        return { handled: false, zoomApplied: false };
      }

      if (newZoomFactor < defaultPresentationZoomRef.current) {
        return { handled: true, zoomApplied: false };
      }

      const SNAP_ZOOM_FACTOR = 0.075;
      /**
       * When zooming with wheel, if the new zoom level is within 10 units of the default presentation zoom,
       * snap back to the default presentation zoom level for better user experience
       */
      const isZoomOut = newZoomFactor < core.getZoom();
      if (isZoomOut && Math.abs(newZoomFactor - defaultPresentationZoomRef.current) <= SNAP_ZOOM_FACTOR) {
        core.zoomTo(defaultPresentationZoomRef.current);
        return { handled: true, zoomApplied: true };
      }

      return { handled: false, zoomApplied: false };
    },
    [defaultPresentationZoomRef, isInPresenterModeRef]
  );

  const wheelToZoom = useCallback(
    rafSchd((e: WheelEvent): void => {
      const currentZoomFactor = core.getZoom();

      const leftSideBarWidth = document.getElementById('leftSideBar')?.offsetWidth || 0;
      const leftPanelWidth = document.getElementById('leftPanel')?.offsetWidth || 0;
      const toolbarHeight = document.getElementById('toolbar')?.offsetHeight || 0;
      const titleBarHeight = document.getElementById('titleBar')?.offsetHeight || 0;

      const newZoomFactor = getZoomFactorForWheel(e.deltaY);
      const offsetX = leftSideBarWidth + leftPanelWidth;
      const offsetY = toolbarHeight + titleBarHeight;

      const { handled } = handlePresenterModeZoom(newZoomFactor);

      if (handled) {
        return;
      }

      if (newZoomFactor !== currentZoomFactor) {
        core.zoomToMouse({
          zoomFactor: newZoomFactor,
          event: e,
          offsetX,
          offsetY,
        });
      }
    }),
    []
  );

  const onWheel = useCallback(
    (e: WheelEvent): void => {
      if (!core.getDocument() || isAiProcessingRef.current) {
        return;
      }

      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        wheelToZoom(e);
      } else if (!core.isContinuousDisplayMode() && allowPageNavigation) {
        wheelToNavigatePages(e);
      }
    },
    [wheelToZoom, wheelToNavigatePages, allowPageNavigation]
  );

  return useCallback((): (() => void) => {
    if (containerRef.current) {
      containerRef.current.addEventListener('wheel', onWheel, { passive: false });
    }

    return (): void => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', onWheel);
      }
    };
  }, [containerRef, onWheel]);
};

export default useDocumentWheel;
