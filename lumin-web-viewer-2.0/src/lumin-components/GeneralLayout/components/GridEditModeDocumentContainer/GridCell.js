import PropTypes from 'prop-types';
import React from 'react';

import SvgElement from 'lumin-components/SvgElement';

import GridViewThumbnail from './GridViewThumbnail';
import SortableThumbnail from './SortableThumbnail';

import * as Styled from './GridEditModeDocumentContainer.styled';

const GridCell = ({
  columnIndex,
  rowIndex,
  style,
  thumbsAndSkeletons,
  numberOfColumns,
  columnWidth,
  rowHeight,
  totalPagesRef,
  moreRowIndex,
  activeSortableIndex,
  isPagetoolDisabled,
  t,
  navigate,
  openRequestAccessModal,
  sortableThumbnailId,
}) => {

  const index = rowIndex * numberOfColumns + columnIndex;

  if (!thumbsAndSkeletons[index] || index >= totalPagesRef.current) {
    return null;
  }

  const thumb = { ...thumbsAndSkeletons[index] } || {};

  if (thumbsAndSkeletons[index]?.type === 'Skeleton') {
    moreRowIndex.current = rowIndex;
    return (
      <Styled.GridSkeletonContainer key={index} style={style}>
        <Styled.GridSkeleton>
          <SvgElement content="lumin-app" width={columnWidth / 4} />
        </Styled.GridSkeleton>
      </Styled.GridSkeletonContainer>
    );
  }

  return (
    <SortableThumbnail
      style={style}
      key={thumbsAndSkeletons[index].id}
      activeIndex={activeSortableIndex}
      pageIndex={thumbsAndSkeletons[index]?.pageIndex}
      data-cy="grid_view_thumbnail"
      isFirstItemOfRow={columnIndex === 0}
    >
      <Styled.GridViewThumbnailContainer
        id={`thumb-${thumbsAndSkeletons[index].id}`}
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
          isDragging={sortableThumbnailId === thumbsAndSkeletons[index]?.pageIndex}
        />
      </Styled.GridViewThumbnailContainer>
    </SortableThumbnail>
  );
};

GridCell.propTypes = {
  columnIndex: PropTypes.number.isRequired,
  rowIndex: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
  thumbsAndSkeletons: PropTypes.array.isRequired,
  numberOfColumns: PropTypes.number.isRequired,
  columnWidth: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired,
  totalPagesRef: PropTypes.object.isRequired,
  moreRowIndex: PropTypes.object.isRequired,
  activeSortableIndex: PropTypes.number.isRequired,
  isPagetoolDisabled: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  openRequestAccessModal: PropTypes.func.isRequired,
  sortableThumbnailId: PropTypes.number,
};

export default GridCell;
