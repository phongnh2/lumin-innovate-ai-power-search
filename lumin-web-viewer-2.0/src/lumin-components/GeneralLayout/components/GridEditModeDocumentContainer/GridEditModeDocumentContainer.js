import { DndContext } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableContext } from '@dnd-kit/sortable';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import rafSchd from 'raf-schd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid } from 'react-window';
import { useDebouncedCallback } from 'use-debounce';
import v4 from 'uuid/v4';

import { HEIGHT_CHANGE_THRESHOLD } from '@new-ui/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { RequestType } from 'lumin-components/RequestPermissionModal/requestType.enum';
import SvgElement from 'lumin-components/SvgElement';
import ViewerBanner from 'lumin-components/ViewerBanner/ViewerBannerV2';
import { useDocumentContext } from 'luminComponents/Document/context/DocumentContext';
import { useRequestAccessModal } from 'luminComponents/DocumentItemContainer/hooks';

import { useCleanup } from 'hooks/useCleanup';
import { useLatestRef } from 'hooks/useLatestRef';
import { usePageToolDisabled } from 'hooks/usePageToolDisabled';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import manipulation from 'utils/manipulation';

import { useIsTempEditMode } from 'features/OpenForm';

import { DEBOUNCED_DOCUMENT_LOADED_TIME, TIMEOUT } from 'constants/lumin-common';
import { THUMBNAIL_WIDTH_CONTAINER, THUMBNAIL_HEIGHT_CONTAINER, HEADER_HEIGHT } from 'constants/thumbnailConstants';

import GridViewThumbnail from './GridViewThumbnail';
import { useRefetchThumbnailsListener } from './hooks/useRefetchThumbnailsListener';
import { useSortableThumbnail } from './hooks/useSortableThumbnail';
import { SortableOverlay } from './SortableOverlay';
import SortableThumbnail from './SortableThumbnail';

import * as Styled from './GridEditModeDocumentContainer.styled';

import styles from './GridEditModeDocumentContainer.module.scss';

const INITIAL_EXTRA_ROWS = 1;
const UPDATE_LAYOUT_DEBOUNCE_TIME = 300;

const getNumberOfColumns = (gridWidth) => Math.floor(gridWidth / THUMBNAIL_WIDTH_CONTAINER);

const withAutoSizer =
  (Component) =>
  // eslint-disable-next-line react/prop-types
  ({ isLeftPanelOpen, isRightPanelOpen, isToolPropertiesOpen, isInFocusMode, ...otherProps }) => {
    const bannerRef = useRef();
    const [bannerHeight, setBannerHeight] = useState(0);

    useEffect(() => {
      let prevHeight = bannerRef.current.offsetHeight;
      const debouncedSetBannerHeight = debounce((height) => {
        setBannerHeight(height);
      }, UPDATE_LAYOUT_DEBOUNCE_TIME);
      const observer = new ResizeObserver(
        rafSchd(() => {
          if (!bannerRef.current) return;
          const currentHeight = bannerRef.current.offsetHeight;
          // Only update if height actually changed (beyond small floating point differences)
          if (Math.abs(currentHeight - prevHeight) > HEIGHT_CHANGE_THRESHOLD) {
            prevHeight = currentHeight;
            debouncedSetBannerHeight(currentHeight);
          }
        })
      );
      observer.observe(bannerRef.current);
      setBannerHeight(bannerRef.current.offsetHeight);
      return () => {
        debouncedSetBannerHeight.cancel();
        observer.disconnect();
      };
    }, []);
    return (
      <Styled.GridWrapper
        $isLeftPanelOpen={isLeftPanelOpen}
        $isRightPanelOpen={isRightPanelOpen}
        $isToolPropertiesOpen={isToolPropertiesOpen}
        $isInFocusMode={isInFocusMode}
      >
        <Styled.BannerWrapper ref={bannerRef}>
          <ViewerBanner />
        </Styled.BannerWrapper>
        <Styled.GridInnerWrapper data-cy="grid_view_mode_list" $bannerHeight={bannerHeight}>
          <AutoSizer>{({ height, width }) => <Component {...otherProps} height={height} width={width} />}</AutoSizer>
        </Styled.GridInnerWrapper>
      </Styled.GridWrapper>
    );
  };

const GridEditModeDocumentContainer = ({
  resetGridViewMode = () => {},
  totalPages = 0,
  updateThumbs = () => {},
  thumbs = [],
  newlyPagesAdded = [],
  height,
  width,
}) => {
  const { t } = useTranslation();
  const { isDisabled: isPagetoolDisabled } = usePageToolDisabled();
  const { isTempEditMode } = useIsTempEditMode();
  const isOffline = useSelector(selectors.isOffline);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { refetchDocument } = useDocumentContext();

  const initRows = Math.ceil((height - HEADER_HEIGHT) / THUMBNAIL_HEIGHT_CONTAINER) + INITIAL_EXTRA_ROWS;
  const numberOfColumns = getNumberOfColumns(width);
  const columnWidth = Math.floor(width / numberOfColumns);
  const rowHeight = (columnWidth * 4) / 3 + 44;
  const [isFetching, setIsFetching] = useState(false);
  const isFetchingRef = useLatestRef(isFetching);
  const gridRef = useRef();

  const thumbsRef = useLatestRef(thumbs);
  const updateThumbsRef = useLatestRef(updateThumbs);

  const pagePerLoad = numberOfColumns * initRows;
  const moreRowIndex = useRef(0);
  const totalPagesRef = useLatestRef(totalPages);
  const navigate = useNavigate();
  const { openModal: openRequestAccessModal, element: requestAccessModalElement } = useRequestAccessModal({
    documentId: currentDocument._id,
    refetchDocument,
    modalType: RequestType.EDITOR,
  });

  const mergeThumbsOptimized = useCallback((existingThumbs, newThumbs) => {
    if (existingThumbs.length === 0) {
      return newThumbs.sort((a, b) => a.pageIndex - b.pageIndex);
    }

    if (newThumbs.length === 0) {
      return existingThumbs;
    }

    const lastExistingIndex = existingThumbs[existingThumbs.length - 1]?.pageIndex || 0;
    const firstNewIndex = Math.min(...newThumbs.map((thumb) => thumb.pageIndex));

    if (firstNewIndex > lastExistingIndex) {
      return [...existingThumbs, ...newThumbs.sort((a, b) => a.pageIndex - b.pageIndex)];
    }

    return [...existingThumbs, ...newThumbs].sort((a, b) => a.pageIndex - b.pageIndex);
  }, []);

  const fetchThumbnails = useCallback(
    async ({ start, end, newlyPagesAddedList }) => {
      try {
        if (isFetchingRef.current) {
          return;
        }
        setIsFetching(true);
        const promises = [];
        const lastIndex = Math.min(end, totalPagesRef.current);
        const currentThumbs = thumbsRef.current;
        const currentExistingIndices = new Set(currentThumbs.map((thumb) => thumb.pageIndex - 1));

        for (let index = start; index < lastIndex; ++index) {
          if (!currentExistingIndices.has(index)) {
            promises.push(manipulation.onLoadThumbs(index));
          }
        }

        if (promises.length > 0) {
          const moreThumbs = (await Promise.all(promises)).map((item) => ({ ...item, id: v4() }));
          const combinedThumbs = mergeThumbsOptimized(currentThumbs, moreThumbs);

          if (isFetchingRef.current) {
            updateThumbsRef.current(combinedThumbs, newlyPagesAddedList);
          }
        }
      } finally {
        setIsFetching(false);
      }
    },
    [totalPagesRef, thumbsRef, mergeThumbsOptimized, isFetchingRef, updateThumbsRef]
  );

  const startFetchThumbnails = useCallback(() => {
    moreRowIndex.current = 0;
    fetchThumbnails({ start: 0, end: pagePerLoad, newlyPagesAddedList: [] });
  }, [fetchThumbnails, pagePerLoad]);

  const debouncedOnDocumentLoaded = useMemo(
    () => debounce(startFetchThumbnails, DEBOUNCED_DOCUMENT_LOADED_TIME),
    [startFetchThumbnails]
  );

  const onScroll = useCallback(
    async ({ scrollTop, verticalScrollDirection }) => {
      const lastIndex = thumbs.length;
      const scrollBottom = scrollTop + window.innerHeight - HEADER_HEIGHT;
      const currentHeight = Math.ceil(lastIndex / numberOfColumns) * THUMBNAIL_HEIGHT_CONTAINER;
      if (
        verticalScrollDirection === 'forward' &&
        scrollBottom > currentHeight - THUMBNAIL_HEIGHT_CONTAINER * 1.5 &&
        !isFetchingRef.current &&
        lastIndex < totalPages
      ) {
        // If user scroll too fast instead of step by step, fetch more pages instead of X pages
        const pageNumberToScrollTo = (moreRowIndex.current + 1) * numberOfColumns;
        const pageNumberToScrollStepByStep = lastIndex + pagePerLoad;
        if (pageNumberToScrollTo > pageNumberToScrollStepByStep) {
          fetchThumbnails({ start: lastIndex, end: pageNumberToScrollTo, newlyPagesAddedList: newlyPagesAdded });
        } else {
          fetchThumbnails({
            start: lastIndex,
            end: pageNumberToScrollStepByStep,
            newlyPagesAddedList: newlyPagesAdded,
          });
        }
      }
    },
    [thumbs.length, numberOfColumns, isFetchingRef, totalPages, pagePerLoad, fetchThumbnails, newlyPagesAdded]
  );

  const renderSkeleton = ({ rowIndex, index, style }) => {
    moreRowIndex.current = rowIndex;
    return (
      <Styled.GridSkeletonContainer key={index} style={style}>
        <Styled.GridSkeleton>
          <SvgElement content="lumin-app" width={columnWidth / 4} />
        </Styled.GridSkeleton>
      </Styled.GridSkeletonContainer>
    );
  };

  const getThumbsAndSkeletons = useCallback(() => {
    let thumbnailList = [];
    if (totalPages > thumbs.length) {
      thumbnailList = [
        ...thumbs,
        ...Array(totalPages - thumbs.length).fill({
          type: 'Skeleton',
          width: THUMBNAIL_WIDTH_CONTAINER,
          height: THUMBNAIL_HEIGHT_CONTAINER,
          className: 'skeleton',
        }),
      ];
    } else {
      thumbnailList = thumbs;
    }
    return thumbnailList;
  }, [thumbs, totalPages]);

  const thumbsAndSkeletons = useMemo(() => getThumbsAndSkeletons(), [getThumbsAndSkeletons]);

  const { sensors, measuring, sortableThumbnailId, collision, onDragStart, onDragEnd, onDragCancel } =
    useSortableThumbnail();

  const activeSortableIndex = useMemo(
    () =>
      sortableThumbnailId != null ? thumbsAndSkeletons.findIndex((item) => item.pageIndex === sortableThumbnailId) : -1,
    [sortableThumbnailId, thumbsAndSkeletons]
  );

  const renderThumbnails = ({ columnIndex, rowIndex, style, data, numberOfColumns, columnWidth, rowHeight }) => {
    const index = rowIndex * numberOfColumns + columnIndex;
    if (!data[index] || index >= totalPagesRef.current) {
      return null;
    }
    const thumb = { ...data[index] } || {};
    if (data[index]?.type === 'Skeleton') {
      return renderSkeleton({
        rowIndex,
        index,
        style,
      });
    }

    return (
      <SortableThumbnail
        style={style}
        key={data[index].id}
        activeIndex={activeSortableIndex}
        pageIndex={data[index]?.pageIndex}
        data-cy="grid_view_thumbnail"
        isFirstItemOfRow={columnIndex === 0}
      >
        <Styled.GridViewThumbnailContainer
          id={`thumb-${data[index].id}`}
          className="thumbs__container"
          data-disabled={isPagetoolDisabled}
          data-cy="grid_view_thumbnail"
        >
          <GridViewThumbnail
            index={index}
            thumb={thumb}
            columnWidth={columnWidth}
            rowHeight={rowHeight}
            t={t}
            navigate={navigate}
            openRequestPermissionModal={openRequestAccessModal}
            sortableThumbnailId={sortableThumbnailId}
            isDragging={sortableThumbnailId === data[index]?.pageIndex}
          />
        </Styled.GridViewThumbnailContainer>
      </SortableThumbnail>
    );
  };

  useEffect(() => {
    core.docViewer.addEventListener('documentLoaded', debouncedOnDocumentLoaded);

    return () => {
      core.docViewer.removeEventListener('documentLoaded', debouncedOnDocumentLoaded);
      debouncedOnDocumentLoaded.cancel();
    };
  }, [debouncedOnDocumentLoaded]);

  useEffect(() => {
    const initThumbnails = numberOfColumns * initRows;
    let timeoutId = null;
    if (thumbs.length < initThumbnails || thumbs.length === 0) {
      const thumbnailInitDelay = 50;
      timeoutId = setTimeout(() => {
        fetchThumbnails({ start: 0, end: initThumbnails, newlyPagesAddedList: [] });
      }, thumbnailInitDelay);
    }
    return () => clearTimeout(timeoutId);
  }, [thumbs.length, numberOfColumns, initRows, fetchThumbnails]);

  const debounceOnScroll = useDebouncedCallback(onScroll, TIMEOUT.GRID_VIEW_SCROLLING);

  useCleanup(() => {
    isFetchingRef.current = false;
    updateThumbsRef.current([]);
    debounceOnScroll.cancel();
  }, [updateThumbsRef]);

  useEffect(() => {
    const showCropPreview = ({ detail: { pageToScroll } }) => {
      if (gridRef.current) {
        // rowIndex in react-window start from 0 so we will - 1
        const rowIndex = Math.ceil(pageToScroll / numberOfColumns) - 1;
        gridRef.current.scrollToItem({
          rowIndex,
          align: 'center',
        });
        // After scroll to the target page for showing crop preview, we will remove redux store of grid view
        resetGridViewMode();
      }
    };
    window.addEventListener('scroll_to_crop_preview', showCropPreview);
    return () => {
      window.removeEventListener('scroll_to_crop_preview', showCropPreview);
    };
  }, [numberOfColumns, resetGridViewMode]);

  const refetchThumbnails = useCallback(() => {
    thumbsRef.current = [];
    updateThumbsRef.current([]);
    startFetchThumbnails();
  }, [startFetchThumbnails, thumbsRef, updateThumbsRef]);

  useRefetchThumbnailsListener(refetchThumbnails);

  const renderGridThumbnails = (args) => renderThumbnails({ ...args, numberOfColumns, columnWidth, rowHeight });

  return (
    <>
      {requestAccessModalElement}
      <DndContext
        autoScroll={{
          enabled: true,
          acceleration: 16,
          layoutShiftCompensation: false,
        }}
        sensors={sensors}
        measuring={measuring}
        collisionDetection={collision}
        modifiers={[restrictToParentElement]}
        onDragStart={onDragStart}
        onDragCancel={onDragCancel}
        onDragEnd={(event) => onDragEnd({ event, thumbsAndSkeletons, updateThumbs })}
      >
        <SortableContext
          items={thumbsAndSkeletons.map((thumb) => thumb.pageIndex)}
          disabled={
            isOffline ||
            isPagetoolDisabled ||
            thumbsAndSkeletons[sortableThumbnailId - 1]?.willBeDeleted ||
            isTempEditMode
          }
        >
          <Grid
            columnCount={numberOfColumns}
            columnWidth={columnWidth}
            height={height}
            rowCount={Math.ceil(thumbsAndSkeletons.length / numberOfColumns)}
            rowHeight={rowHeight}
            width={width}
            ref={gridRef}
            overscanRowCount={3}
            itemData={thumbsAndSkeletons}
            onScroll={debounceOnScroll}
            className={styles.gridContainer}
          >
            {renderGridThumbnails}
          </Grid>
        </SortableContext>
        <SortableOverlay activeId={sortableThumbnailId} portalOverlay={gridRef.current?._outerRef}>
          <Styled.GridViewThumbnailContainer className="thumbs__container">
            <GridViewThumbnail
              index={sortableThumbnailId - 1}
              thumb={thumbsAndSkeletons.find((thumb) => thumb.pageIndex === sortableThumbnailId)}
              columnWidth={columnWidth}
              rowHeight={rowHeight}
              t={t}
              navigate={navigate}
              openRequestPermissionModal={openRequestAccessModal}
              isOverlay
            />
          </Styled.GridViewThumbnailContainer>
        </SortableOverlay>
      </DndContext>
    </>
  );
};

GridEditModeDocumentContainer.propTypes = {
  totalPages: PropTypes.number,
  updateThumbs: PropTypes.func,
  newlyPagesAdded: PropTypes.array,
  thumbs: PropTypes.array,
  resetGridViewMode: PropTypes.func,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => ({
  thumbs: selectors.getThumbs(state),
  totalPages: selectors.getTotalPages(state),
  isShowTopBar: selectors.getIsShowTopBar(state),
  newlyPagesAdded: selectors.getNewlyPagesAdded(state),
  currentUser: selectors.getCurrentUser(state),
  isLeftPanelOpen: selectors.isLeftPanelOpen(state),
  isRightPanelOpen: selectors.isRightPanelOpen(state),
  isToolPropertiesOpen: selectors.isToolPropertiesOpen(state),
  isInFocusMode: selectors.isInFocusMode(state),
});

const mapDispatchToProps = (dispatch) => ({
  updateThumbs: (thumbs, newlyPagesAdded) => dispatch(actions.updateThumbs(thumbs, newlyPagesAdded)),
  resetGridViewMode: () => dispatch(actions.resetGridViewMode()),
  scrollToPageInGridViewMode: (gridViewMode) => dispatch(actions.scrollToPageInGridViewMode(gridViewMode)),
});
export default connect(mapStateToProps, mapDispatchToProps)(withAutoSizer(GridEditModeDocumentContainer));
