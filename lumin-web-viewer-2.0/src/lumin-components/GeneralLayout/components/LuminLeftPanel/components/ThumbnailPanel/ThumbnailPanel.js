/* eslint-disable class-methods-use-this */
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import classNames from 'classnames';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { connect, useSelector } from 'react-redux';
import { List } from 'react-virtualized';
import AutoSizer from 'react-virtualized-auto-sizer';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ViewerContext from 'screens/Viewer/Context';

import { useCleanup } from 'hooks/useCleanup';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import getCurrentRole from 'helpers/getCurrentRole';
import { mergeExternalWebViewerDocument, mergeDocument } from 'helpers/pageManipulation';

import { DocumentPermission } from 'utils/documentPermissionUtils';

import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';

import { general } from 'constants/documentType';

import { useDndHandler } from './hooks/useDndHandler';
import Thumbnail from './Thumbnail';
import { isPagetoolActionNotAvailable } from './utils';
import PanelHeader from '../PanelHeader';

import * as Styled from './ThumbnailPanel.styled';

const DRAW_ANNOTATION_DEBOUNCE_TIME = 100;
const THUMBNAIL_SIZE = 150;
const PORTRAIT_THUMBNAIL_HEIGHT = 172;
const LANDSCAPE_THUMBNAIL_HEIGHT = 140;
const THUMBNAIL_VERTICAL_MARGIN = 8;
const HEADER_HEIGHT = 48;

// eslint-disable-next-line sonarjs/cognitive-complexity
const ThumbnailsPanel = ({ setSelectedPageThumbnails }) => {
  const pendingThumbs = useRef([]);
  const thumbs = useRef([]);
  const afterMovePageNumber = useRef(null);
  const activeThumbRenders = useRef({});
  const [canLoad, setCanLoad] = useState(true);
  const [canLoadThumb, setCanLoadThumb] = useState(false);
  const { t } = useTranslation();
  const { listRef, setListRef, onDragEnd } = useDndHandler();
  const isAnnotationLoaded = useSelector(selectors.getAnnotationsLoaded);
  const isDisabled = useSelector((state) => selectors.isElementDisabled(state, 'thumbnailsPanel'));
  const totalPages = useSelector(selectors.getTotalPages);
  const selectedPageIndexes = useShallowSelector(selectors.getSelectedThumbnailPageIndexes);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isOffline = useSelector(selectors.isOffline);
  const isInContentEditMode = core.getContentEditManager().isInContentEditMode();
  const { pageWillBeDeleted } = useContext(ViewerContext);

  const onBeginRendering = () => {
    setCanLoad(false);
  };

  const getThumbnailSize = (pageIndex) => {
    const pageWidth = core.getPageWidth(pageIndex);
    const pageHeight = core.getPageHeight(pageIndex);
    return {
      width: 96,
      // eslint-disable-next-line no-magic-numbers
      height: Math.round((96 * pageHeight) / pageWidth),
    };
  };

  const cleanUpDrawAnnotByIndex = useCallback((pageIndex) => {
    if (activeThumbRenders.current[pageIndex]) {
      activeThumbRenders.current[pageIndex].cancel();
    }
  }, []);

  const cleanUpDrawAnnots = useCallback(() => {
    Object.keys(activeThumbRenders.current).forEach((pageNumber) => {
      cleanUpDrawAnnotByIndex(pageNumber);
    });
  }, [cleanUpDrawAnnotByIndex]);

  const updateAnnotations = useCallback(
    (pageIndex) => {
      const thumbContainer = thumbs.current[pageIndex] && thumbs.current[pageIndex].element;
      if (!thumbContainer) {
        return;
      }
      const pageNumber = pageIndex + 1;

      if (pageWillBeDeleted === pageNumber) {
        return;
      }

      const pageWidth = core.getPageWidth(pageNumber);

      const { width, height } = getThumbnailSize(pageNumber);

      const annotCanvas = thumbContainer.querySelector('.annotation-image') || document.createElement('canvas');
      annotCanvas.className = 'annotation-image';
      annotCanvas.style.maxHeight = `${THUMBNAIL_SIZE}px`;
      annotCanvas.style.maxWidth = `${THUMBNAIL_SIZE}px`;

      const ctx = annotCanvas.getContext('2d');

      let zoom = 1;
      let rotation = core.getCompleteRotation(pageNumber) - core.getRotation(pageNumber);
      if (rotation < 0) {
        // eslint-disable-next-line no-magic-numbers
        rotation += 4;
      }
      const multiplier = window.Core.getCanvasMultiplier();

      // eslint-disable-next-line no-magic-numbers
      if (rotation % 2 === 0) {
        annotCanvas.width = width;
        annotCanvas.height = height;
        zoom = annotCanvas.width / pageWidth;
        zoom /= multiplier;
      } else {
        annotCanvas.height = width;
        annotCanvas.width = height;

        zoom = annotCanvas.height / pageWidth;
        zoom /= multiplier;
      }

      thumbContainer?.appendChild(annotCanvas);
      core.setAnnotationCanvasTransform(ctx, zoom, rotation);

      let options = {
        pageNumber,
        overrideCanvas: annotCanvas,
        namespace: 'thumbnails',
      };

      const thumb = thumbContainer.querySelector('.page-image');

      if (thumb) {
        options = {
          ...options,
          overridePageRotation: rotation,
          overridePageCanvas: thumb,
        };
      } else {
        return;
      }

      if (!activeThumbRenders.current[pageNumber]) {
        cleanUpDrawAnnotByIndex(pageNumber);
        activeThumbRenders.current[pageNumber] = debounce(core.drawAnnotations, DRAW_ANNOTATION_DEBOUNCE_TIME);
      }
      const debouncedDraw = activeThumbRenders.current[pageNumber];
      debouncedDraw(options);
    },
    [cleanUpDrawAnnotByIndex, pageWillBeDeleted]
  );

  const onPageComplete = () => {
    if (afterMovePageNumber) {
      core.setCurrentPage(afterMovePageNumber.current);
      afterMovePageNumber.current = null;
    }
  };

  const onFinishedRendering = (needsMoreRendering) => {
    if (!needsMoreRendering) {
      setCanLoad(true);
    }
  };

  const onAnnotationChanged = useCallback(
    (annots) => {
      const indices = [];

      annots.forEach((annot) => {
        const pageIndex = annot.PageNumber - 1;
        if (!annot.Listable || indices.indexOf(pageIndex) > -1) {
          return;
        }
        indices.push(pageIndex);

        updateAnnotations(pageIndex);
      });
    },
    [updateAnnotations]
  );

  const onPagesUpdated = useCallback(
    (changes) => {
      if (!changes) {
        return;
      }

      if (listRef.current) {
        listRef.current.recomputeRowHeights();
      }

      let updatedPagesIndexes = Array.from(selectedPageIndexes);

      if (changes.removed) {
        updatedPagesIndexes = updatedPagesIndexes.filter((pageIndex) => changes.removed.indexOf(pageIndex + 1) === -1);
      }

      if (changes.moved) {
        updatedPagesIndexes = updatedPagesIndexes.map((pageIndex) =>
          changes.moved[pageIndex + 1] ? changes.moved[pageIndex + 1] - 1 : pageIndex
        );
      }

      setSelectedPageThumbnails(updatedPagesIndexes);
    },
    [listRef, selectedPageIndexes, setSelectedPageThumbnails]
  );

  const onDocumentLoaded = useCallback(() => {
    activeThumbRenders.current = {};
    if (listRef.current) {
      listRef.current.recomputeRowHeights();
    }
    setSelectedPageThumbnails([]);
  }, [listRef, setSelectedPageThumbnails]);

  const onPageNumberUpdated = (pageNumber) => {
    if (listRef.current) {
      const pageIndex = pageNumber - 1;
      listRef.current.scrollToRow(pageIndex);
    }
  };

  const getPendingThumbIndex = (pageIndex) =>
    pendingThumbs.current.findIndex((thumbStatus) => thumbStatus.pageIndex === pageIndex);

  const thumbIsPending = (pageIndex) => getPendingThumbIndex(pageIndex) !== -1;

  const thumbIsLoaded = (pageIndex) => thumbs.current[pageIndex]?.loaded;

  const onLoadThumbnail = (pageIndex, element, id) => {
    if (!thumbIsLoaded(pageIndex) && !thumbIsPending(pageIndex)) {
      thumbs.current[pageIndex] = {
        element,
        loaded: false,
      };

      pendingThumbs.current.push({
        pageIndex,
        id,
      });
    }
  };

  const removeFromPendingThumbs = (pageIndex) => {
    const index = getPendingThumbIndex(pageIndex);
    if (index !== -1) {
      pendingThumbs.current.splice(index, 1);
    }
  };

  const onCancel = (pageIndex) => {
    const index = getPendingThumbIndex(pageIndex);
    if (index !== -1) {
      core.cancelLoadThumbnail(pendingThumbs.current[index].id);
      pendingThumbs.current.splice(index, 1);
    }
  };

  const onRemove = (pageIndex) => {
    onCancel(pageIndex);
    thumbs.current[pageIndex] = null;
  };

  const renderThumbnails = ({ index, key, style }) => {
    const { width, height } = getThumbnailSize(index + 1);
    const isPortray = height >= width;
    const wrapperStyle = isPortray
      ? { height: PORTRAIT_THUMBNAIL_HEIGHT, width: 144 }
      : { height: LANDSCAPE_THUMBNAIL_HEIGHT, width: 176 };
    const _wrapperStyle = { ...wrapperStyle };
    // NOTE: margin bottom and top of thumbnail item is 2 each.
    _wrapperStyle.height += THUMBNAIL_VERTICAL_MARGIN;
    const canEdit = DocumentPermission.canEdit({ roleOfDocument: getCurrentRole(currentDocument) });
    const isPdfDocument = currentDocument.mimeType === general.PDF;
    const isPageWillBeDeleted = pageWillBeDeleted === index + 1;
    const isValidDocument = featureStoragePolicy.isFeatureEnabledForStorage(
      AppFeatures.THUMBNAIL_ACTIONS,
      currentDocument.service
    );
    const isDragDisabled =
      isPagetoolActionNotAvailable(currentUser) ||
      !canEdit ||
      !isAnnotationLoaded ||
      !isPdfDocument ||
      isOffline ||
      !isValidDocument ||
      isPageWillBeDeleted;

    const className = classNames({
      row: true,
      disabled: isDragDisabled,
    });

    return (
      <Draggable key={index} index={index} draggableId={`drag-${index}`} isDragDisabled={isDragDisabled}>
        {(draggableProvided) => (
          <div className={className} key={key} style={{ ...style, display: 'flex' }}>
            <div
              style={{
                ..._wrapperStyle,
                width: 'fit-content',
                alignSelf: 'center',
                ...draggableProvided.draggableProps.style,
              }}
              ref={draggableProvided.innerRef}
              {...draggableProvided.draggableProps}
              {...draggableProvided.dragHandleProps}
            >
              <Thumbnail
                isPortray={isPortray}
                wrapperStyle={wrapperStyle}
                isSelected={selectedPageIndexes.includes(index)}
                index={index}
                canLoad={canLoad}
                onLoadThumbnail={onLoadThumbnail}
                onCancel={onCancel}
                onRemove={onRemove}
                onFinishLoading={removeFromPendingThumbs}
                updateAnnotations={updateAnnotations}
                imageDimentsion={{ width, height }}
                disabled={isDragDisabled}
                isInContentEditMode={isInContentEditMode}
                disabledAction={isDragDisabled}
              />
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const removeEvents = useCallback(() => {
    core.removeEventListener('finishedRendering', onFinishedRendering);
    core.removeEventListener('beginRendering', onBeginRendering);
    core.removeEventListener('annotationChanged', onAnnotationChanged);
    core.removeEventListener('documentLoaded', onDocumentLoaded);
    core.removeEventListener('pagesUpdated', onPagesUpdated);
    core.removeEventListener('pageNumberUpdated', onPageNumberUpdated);
    core.removeEventListener('annotationHidden', onAnnotationChanged);
    core.removeEventListener('pageComplete', onPageComplete);
  }, [onAnnotationChanged, onDocumentLoaded, onPagesUpdated]);

  const onManipupdated = useCallback(() => {
    setCanLoadThumb(true);
    core.addEventListener('finishedRendering', onFinishedRendering);
    core.addEventListener('beginRendering', onBeginRendering);
    core.addEventListener('pagesUpdated', onPagesUpdated);
    core.addEventListener('annotationChanged', onAnnotationChanged);
    core.addEventListener('documentLoaded', onDocumentLoaded);
    core.addEventListener('pageNumberUpdated', onPageNumberUpdated);
    core.addEventListener('annotationHidden', onAnnotationChanged);
    core.addEventListener('pageComplete', onPageComplete);
  }, [onAnnotationChanged, onDocumentLoaded, onPagesUpdated]);

  const onAfterManipulationUpdated = useCallback(() => {
    if (listRef.current) {
      listRef.current.recomputeRowHeights();
    }
    removeEvents();
    onManipupdated();
  }, [listRef, onManipupdated, removeEvents]);

  useEffect(() => {
    core.docViewer.addEventListener('native_manipUpdated', onAfterManipulationUpdated);
    return () => {
      core.docViewer.removeEventListener('native_manipUpdated', onAfterManipulationUpdated);
    };
  }, [onAfterManipulationUpdated]);

  useEffect(() => {
    onManipupdated();
    core.docViewer.addEventListener('native_manipUpdated', onAfterManipulationUpdated);
    return () => {
      removeEvents();
    };
  }, [onAfterManipulationUpdated, onManipupdated, removeEvents]);

  useCleanup(cleanUpDrawAnnots);

  const dropRenderClone = (provided, _, rubric) => {
    const { width, height } = getThumbnailSize(rubric.source.index + 1);
    const isPortray = height >= width;
    const wrapperStyle = isPortray
      ? { height: PORTRAIT_THUMBNAIL_HEIGHT, width: 144 }
      : { height: LANDSCAPE_THUMBNAIL_HEIGHT, width: 176 };
    return (
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        style={{ ...provided.draggableProps.style }}
      >
        <Thumbnail
          index={rubric.source.index}
          wrapperStyle={wrapperStyle}
          isPortray={isPortray}
          canLoad={canLoad}
          onLoadThumbnail={onLoadThumbnail}
          onCancel={onCancel}
          onRemove={onRemove}
          onFinishLoading={removeFromPendingThumbs}
          updateAnnotations={updateAnnotations}
          imageDimentsion={{ width, height }}
          isInContentEditMode={isInContentEditMode}
        />
      </div>
    );
  };

  return isDisabled || !canLoadThumb ? null : (
    <Styled.ThumbnailPanel data-element="thumbnailsPanel" className="ThumbnailsPanel">
      <PanelHeader title={t('viewer.viewerLeftPanel.thumbnails')} />
      <DragDropContext onDragEnd={onDragEnd}>
        <AutoSizer>
          {({ height, width }) => (
            <Droppable droppableId="thumbnail-panel-droppable" mode="virtual" renderClone={dropRenderClone}>
              {(droppableProvided) => (
                <div className="virtualized-thumbnails-container">
                  <List
                    ref={setListRef(droppableProvided)}
                    {...droppableProvided.droppableProps}
                    // eslint-disable-next-line no-magic-numbers
                    height={height - HEADER_HEIGHT}
                    width={width}
                    rowHeight={PORTRAIT_THUMBNAIL_HEIGHT + THUMBNAIL_VERTICAL_MARGIN * 2}
                    rowCount={totalPages}
                    overscanRowCount={10}
                    rowRenderer={renderThumbnails}
                    className="thumbnailsList custom-scrollbar-reskin"
                  />
                </div>
              )}
            </Droppable>
          )}
        </AutoSizer>
      </DragDropContext>
    </Styled.ThumbnailPanel>
  );
};

ThumbnailsPanel.propTypes = {
  isDisabled: PropTypes.bool,
  totalPages: PropTypes.number,
  selectedPageIndexes: PropTypes.arrayOf(PropTypes.number),
  setSelectedPageThumbnails: PropTypes.func.isRequired,
  currentDocument: PropTypes.object,
  currentUser: PropTypes.object,
};

ThumbnailsPanel.defaultProps = {
  isDisabled: false,
  totalPages: 1,
  selectedPageIndexes: [],
  currentDocument: {},
  currentUser: {},
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  setSelectedPageThumbnails: (pages) => dispatch(actions.setSelectedPageThumbnails(pages)),
  showWarningMessage: (warning) => dispatch(actions.showWarningMessage(warning)),
  mergeDocument: (file, mergeToPage) => dispatch(mergeDocument(file, mergeToPage)),
  mergeExternalWebViewerDocument: (viewerID, mergeToPage) =>
    dispatch(mergeExternalWebViewerDocument(viewerID, mergeToPage)),
});

export default withTranslation()(connect(null, mapDispatchToProps)(ThumbnailsPanel));
