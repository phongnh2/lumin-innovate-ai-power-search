import classNames from 'classnames';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { HEIGHT_CHANGE_THRESHOLD } from '@new-ui/constants';
import * as eventListeners from 'src/event-listeners';

import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import DocumentResizeListener from 'lumin-components/DocumentContainer/components/DocumentResizeListener';
import DocumentViewerSkeleton from 'lumin-components/DocumentViewerSkeleton';
import LuminCommentsPanel from 'lumin-components/GeneralLayout/components/LuminCommentsPanel';
import ViewerBanner from 'lumin-components/ViewerBanner/ViewerBannerV2';
import DocumentLoadingBar from 'luminComponents/DocumentLoadingBar';

import { useCleanup } from 'hooks/useCleanup';
import { useLatestRef } from 'hooks/useLatestRef';
import { useShallowSelector } from 'hooks/useShallowSelector';

import loadInitialDocument from 'helpers/loadInitialDocument';
import touchEventManager from 'helpers/TouchEventManager';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { documentSyncSelectors } from 'features/Document/slices';
import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';
import FloatingToolbar from 'features/FloatingToolbar';

import { COMMENT_PANEL_LAYOUT_STATE, PageToolViewMode } from 'constants/documentConstants';
import { COMMENT_PANEL_WIDTH, TIMEOUT, LUMIN_COMMENT_SPACING, RIGHT_COMMENT_SPACING } from 'constants/lumin-common';
import { TOOLS_NAME } from 'constants/toolsName';

import useDocumentWheel from './hooks/useDocumentWheel';
import { usePresenterModeHandlers } from './hooks/usePresenterModeHandlers';
import { CommentStyles } from '../LuminCommentsPanel/constant';
import { TOOL_PROPERTIES_VALUE } from '../LuminLeftPanel/constants';
import PageNavOverlay from '../PageNavigation';

import * as Styled from './DocumentContainer.styled';

import 'luminComponents/DocumentContainer/DocumentContainer.scss';

const PresentModeCursor = lazyWithRetry(() => import('./PresentModeCursor'));

const RESIZE_DEBOUNCE_TIME = 500;
const UPDATE_LAYOUT_DEBOUNCE_TIME = 300;
const BLUR_CONTENT_EDIT_BOX_TIME = 200;
const ALLOW_SELF_SCROLL_CLASS = 'allow-self-scroll';

const DocumentContainer = ({
  isCommentPanelOpen = false,
  zoom,
  dispatch,
  closeElements,
  isPageEditMode = false,
  pageEditDisplayMode = PageToolViewMode.LIST,
  isLoadingDocument,
  allowPageNavigation = true,
  displayMode = '',
  setCommentPanelLayoutState = () => {},
  isLeftPanelOpen,
  isRightPanelOpen,
  isToolPropertiesOpen,
  isPreviewOriginalVersionMode = false,
  isDefaultMode = false,
  toolPropertiesValue = TOOL_PROPERTIES_VALUE.DEFAULT,
  isOffline = false,
  isInFocusMode,
  isNarrowScreen = false,
  isInPresenterMode = false,
}) => {
  const [bannerHeight, setBannerHeight] = useState(0);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isAiProcessing = useShallowSelector(editorChatBotSelectors.getIsAiProcessing);
  const isSyncing = useSelector(documentSyncSelectors.isSyncing);
  const isFileContentChanged = useSelector(documentSyncSelectors.isFileContentChanged);
  const prevZoom = useRef(zoom);
  const prevDisplayMode = useRef(displayMode);
  const prevIsRightPanelOpen = useRef(isRightPanelOpen);
  const prevIsLeftPanelOpen = useRef(isLeftPanelOpen);
  const prevPageEditMode = useRef(isPageEditMode);
  const isInPresenterModeRef = useLatestRef(isInPresenterMode);

  const documentRef = useRef(null);
  const containerRef = useRef(null);
  const bannerRef = useRef(null);
  const bannerResizeObserverRef = useRef(null);
  const isSyncInProgress = isSyncing || currentDocument?.status?.isSyncing;
  const shouldShowPageNavigation = !isAiProcessing;
  const isProcessingDocument = isAiProcessing || isSyncInProgress;
  const isDocumentLocked = isDefaultMode ? isFileContentChanged && isProcessingDocument : isProcessingDocument;
  const setupWheelHandler = useDocumentWheel(containerRef, allowPageNavigation);

  const updateCommentPanelLayout = useCallback(() => {
    if (!documentRef.current || isInPresenterModeRef.current) {
      return;
    }

    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.MEASURE) {
      setCommentPanelLayoutState(COMMENT_PANEL_LAYOUT_STATE.ON_DOCUMENT);
      return;
    }

    const { width: containerWidth } = documentRef.current.parentNode.getBoundingClientRect();
    const { width: pageWidth } = documentRef.current.getBoundingClientRect() || {};
    const rightSpace = (containerWidth - pageWidth) / 2 - RIGHT_COMMENT_SPACING;
    const COMMENT_PANEL_TOTAL_WIDTH = LUMIN_COMMENT_SPACING * 2 + COMMENT_PANEL_WIDTH;

    if (rightSpace >= COMMENT_PANEL_TOTAL_WIDTH) {
      setCommentPanelLayoutState(COMMENT_PANEL_LAYOUT_STATE.PUSH_LEFT_SIDE);
    } else {
      setCommentPanelLayoutState(COMMENT_PANEL_LAYOUT_STATE.ON_DOCUMENT);
    }
  }, [setCommentPanelLayoutState, toolPropertiesValue]);

  const updateCommentPanelLayoutDebounced = useCallback(
    debounce(() => updateCommentPanelLayout(), UPDATE_LAYOUT_DEBOUNCE_TIME),
    [updateCommentPanelLayout]
  );

  const onAnnotationChanged = useCallback(() => {
    updateCommentPanelLayout();
  }, [updateCommentPanelLayout]);

  const onAnnotationChangedDebounced = useCallback(
    debounce((annotations) => {
      if (annotations.some((annot) => annot instanceof window.Core.Annotations.StickyAnnotation)) {
        onAnnotationChanged();
      }
    }, TIMEOUT.CONTENT_CHANGED),
    [onAnnotationChanged]
  );

  const handleBlurEditorBoxDebounced = useCallback(
    debounce(
      () => {
        const annotation = core.getSelectedAnnotations()[0];
        const contentBoxId = annotation?.getCustomData('contentEditBoxId');
        if (!contentBoxId) {
          return;
        }
        core.deselectAllAnnotations();
      },
      BLUR_CONTENT_EDIT_BOX_TIME,
      { leading: true }
    ),
    []
  );

  const handleWindowResize = useCallback(
    debounce(() => {
      updateCommentPanelLayoutDebounced();
    }, RESIZE_DEBOUNCE_TIME),
    [updateCommentPanelLayoutDebounced]
  );

  const onDropInViewer = useCallback((e) => {
    e.persist();
    eventListeners.onDropInViewer(store)(e);
  }, []);

  const disconnectBannerResizeObserver = useCallback(() => {
    if (bannerResizeObserverRef.current && bannerRef.current) {
      bannerResizeObserverRef.current.unobserve(bannerRef.current);
    }
    bannerResizeObserverRef.current = null;
  }, []);

  const handleScroll = useCallback(() => {
    const { scrollTop } = containerRef.current;
    closeElements(['annotationPopup', 'textPopup']);
    const notePanelScroll = document.getElementById(CommentStyles.PANEL_SCROLL_ID);
    if (notePanelScroll && !notePanelScroll.classList.contains(ALLOW_SELF_SCROLL_CLASS)) {
      notePanelScroll.scrollTop = scrollTop;
    }
    const contentEditManager = core.getContentEditManager();
    if (contentEditManager.isInContentEditMode()) {
      handleBlurEditorBoxDebounced();
    }
  }, [closeElements]);

  const onTransitionEnd = useCallback((event) => {
    const transitionProperiesToIgnore = ['background-color', 'opacity'];
    if (documentRef.current && !transitionProperiesToIgnore.includes(event.propertyName)) {
      core.scrollViewUpdated();
    }
  }, []);

  usePresenterModeHandlers(containerRef);

  useEffect(() => {
    touchEventManager.initialize(documentRef.current, containerRef.current);
    core.setScrollViewElement(containerRef.current);
    core.setViewerElement(documentRef.current);
    const debouncedSetBannerHeight = debounce((height) => {
      setBannerHeight(height);
    }, UPDATE_LAYOUT_DEBOUNCE_TIME);

    if (bannerRef.current) {
      let prevHeight = bannerRef.current.offsetHeight;

      bannerResizeObserverRef.current = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          if (!bannerRef.current) return;
          const currentHeight = bannerRef.current.offsetHeight;
          // Only update if height actually changed (beyond small floating point differences)
          if (Math.abs(currentHeight - prevHeight) > HEIGHT_CHANGE_THRESHOLD) {
            prevHeight = currentHeight;
            debouncedSetBannerHeight(currentHeight);
          }
        });
      });
      bannerResizeObserverRef.current.observe(bannerRef.current);
      setBannerHeight(bannerRef.current.offsetHeight);
    }

    loadInitialDocument(dispatch);
    window.addEventListener('resize', handleWindowResize);
    core.addEventListener('annotationChanged', onAnnotationChangedDebounced);

    const cleanupWheelHandler = setupWheelHandler();

    return () => {
      touchEventManager.terminate();
      window.removeEventListener('resize', handleWindowResize);
      core.removeEventListener('annotationChanged', onAnnotationChangedDebounced);
      disconnectBannerResizeObserver();
      const signatureTool = core.getTool(TOOLS_NAME.SIGNATURE);
      signatureTool.clearPreviewSignatureElement?.();
      cleanupWheelHandler();
      debouncedSetBannerHeight.cancel();
    };
  }, []);

  useEffect(() => {
    updateCommentPanelLayout();
  }, [updateCommentPanelLayout]);

  useEffect(() => {
    const shouldRecalculateCommentLayout =
      zoom !== prevZoom.current ||
      displayMode !== prevDisplayMode.current ||
      isRightPanelOpen !== prevIsRightPanelOpen.current ||
      isLeftPanelOpen !== prevIsLeftPanelOpen.current;

    if (shouldRecalculateCommentLayout) {
      updateCommentPanelLayoutDebounced();
    }

    prevZoom.current = zoom;
    prevDisplayMode.current = displayMode;
    prevIsRightPanelOpen.current = isRightPanelOpen;
    prevIsLeftPanelOpen.current = isLeftPanelOpen;
  }, [zoom, displayMode, isRightPanelOpen, isLeftPanelOpen, updateCommentPanelLayoutDebounced]);

  useEffect(() => {
    const prevIsPageEditMode = prevPageEditMode.current;
    if (isPageEditMode !== prevIsPageEditMode) {
      core.scrollViewUpdated();
    }
    prevPageEditMode.current = isPageEditMode;
  }, [isPageEditMode]);

  useCleanup(() => {
    updateCommentPanelLayoutDebounced.cancel();
  }, []);

  const isGridView = pageEditDisplayMode === PageToolViewMode.GRID;

  const documentContainerClassName = classNames(
    {
      DocumentContainer: true,
      hidden: isGridView && isPageEditMode,
      loading: isLoadingDocument,
    },
    'custom-scrollbar-reskin'
  );
  const presenterModeStyle = isInPresenterMode ? { background: '#000', padding: 0 } : {};
  return (
    <Styled.DocumentContainerWrapper
      $isInFocusMode={isInFocusMode}
      $isLeftPanelOpen={isLeftPanelOpen}
      $isRightPanelOpen={isRightPanelOpen}
      $isToolPropertiesOpen={isToolPropertiesOpen}
      $isPreviewOriginalVersionMode={isPreviewOriginalVersionMode}
      $isDocumentRevision={toolPropertiesValue === TOOL_PROPERTIES_VALUE.REVISION}
      style={{ ...(isNarrowScreen && { width: '100vw', maxWidth: '100vw' }), ...presenterModeStyle }}
      data-locked={isDocumentLocked}
    >
      {isInPresenterMode && <PresentModeCursor />}
      <Styled.LoadingBarWrapper>
        <DocumentLoadingBar />
      </Styled.LoadingBarWrapper>
      <Styled.BannerWrapper ref={bannerRef} $isLoadingDocument={isLoadingDocument}>
        <ViewerBanner />
      </Styled.BannerWrapper>
      <Styled.FloatingToolbarWrapper>
        <FloatingToolbar />
      </Styled.FloatingToolbarWrapper>
      <DocumentResizeListener isLoadingDocument={isLoadingDocument} containerElement={containerRef.current}>
        <Styled.DocumentContainerItself
          $isPreviewOriginalVersionMode={isPreviewOriginalVersionMode}
          $isOpenCommentPanel={isCommentPanelOpen}
          $isNarrowScreen={isNarrowScreen}
          className={classNames(documentContainerClassName, 'custom-scrollbar-reskin')}
          id="DocumentContainer"
          ref={containerRef}
          data-element="documentContainer"
          onScroll={handleScroll}
          onTransitionEnd={onTransitionEnd}
          $isLoadingDocument={isLoadingDocument || isAiProcessing}
          $bannerHeight={bannerHeight}
          style={presenterModeStyle}
          data-disabled={isDocumentLocked}
          data-locked={isDocumentLocked}
        >
          {isLoadingDocument && (
            <Styled.SkeletonContainer>
              <DocumentViewerSkeleton />
            </Styled.SkeletonContainer>
          )}
          <Styled.DocumentElement
            /*
                Issue LMV-3745
                Need to add notranslate class to prevent google translate apply
                to document container
                https://stackoverflow.com/questions/9628507/how-can-i-tell-google-translate-to-not-translate-a-section-of-a-website
              */
            className={classNames('document notranslate')}
            data-default-mode={isDefaultMode && !isToolPropertiesOpen}
            data-offline-mode={isOffline}
            id="document-scroll"
            ref={documentRef}
            tabIndex="-1"
            onMouseUp={onDropInViewer}
          />
        </Styled.DocumentContainerItself>
      </DocumentResizeListener>

      {shouldShowPageNavigation && <PageNavOverlay isNarrowScreen={isNarrowScreen} />}
      {isDefaultMode && !isNarrowScreen && containerRef.current && (
        <LuminCommentsPanel documentContainerRef={containerRef.current} />
      )}
    </Styled.DocumentContainerWrapper>
  );
};

DocumentContainer.propTypes = {
  isCommentPanelOpen: PropTypes.bool,
  zoom: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  closeElements: PropTypes.func.isRequired,
  isPageEditMode: PropTypes.bool,
  pageEditDisplayMode: PropTypes.string,
  isLoadingDocument: PropTypes.bool.isRequired,
  allowPageNavigation: PropTypes.bool,
  displayMode: PropTypes.string,
  setCommentPanelLayoutState: PropTypes.func,

  // NEW UI
  isLeftPanelOpen: PropTypes.bool.isRequired,
  isRightPanelOpen: PropTypes.bool.isRequired,
  isToolPropertiesOpen: PropTypes.bool.isRequired,
  isPreviewOriginalVersionMode: PropTypes.bool,
  isDefaultMode: PropTypes.bool,
  toolPropertiesValue: PropTypes.string,
  isOffline: PropTypes.bool,
  isInFocusMode: PropTypes.bool.isRequired,
  isNarrowScreen: PropTypes.bool,
  isInPresenterMode: PropTypes.bool,
};

export default DocumentContainer;
