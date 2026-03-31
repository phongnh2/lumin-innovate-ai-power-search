import React, {
  useRef, useCallback,
} from 'react';
import PropTypes from 'prop-types';

import DocumentGridItemSkeleton from 'lumin-components/DocumentSkeleton/DocumentGridItemSkeleton';
import * as Styled from './VirtualizedGrid.styled';

function VirtualizedGrid({
  items,
  loadingItemCount,
  isLoadingMore,
  loadMore,
  cellRenderer,
  rowCount,
  columnCount,
  hasCache,
  ...otherProps
}) {
  // const _windowScrollerRef = useRef(null);

  // const isTabletUpMatch = useMedia(`(min-width: ${Breakpoints.md}px)`);

  // const isDesktopUpMatch = useMedia(`(min-width: ${Breakpoints.xl}px)`);

  // const _cache = useMemo(() => new CellMeasurerCache({
  //   defaultWidth: 200,
  //   fixedWidth: true,
  //   // Normally, every cell gets measured individually and is very slow.
  //   // However, with the keyMapper prop we can specify a constant return value and
  //   // tell CellMeasurer that all measurements after the first one will hit the
  //   // cache and we get a speedy solution.
  //   keyMapper: () => 1,
  //   /**
  //    * need to watch tablet and desktop media so as to re-calculate row height
  //    */
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }), [isTabletUpMatch, isDesktopUpMatch]);

  // const _isRowLoaded = ({ index }) => index < rowCount - 1;

  // const _cellRendererHOC = useCallback(
  //   (params) => {
  //     const {
  //       columnIndex, rowIndex, style, key, parent,
  //     } = params;
  //     const cellIndex = columnCount * rowIndex + columnIndex;
  //     if (!items[cellIndex]) {
  //       return null;
  //     }
  //     if (!hasCache) {
  //       return (
  //         <div style={style} key={key}>
  //           {cellRenderer(params)}
  //         </div>
  //       );
  //     }

  //     return (
  //       <CellMeasurer
  //         columnIndex={columnIndex}
  //         cache={_cache}
  //         key={key}
  //         rowIndex={rowIndex}
  //         parent={parent}
  //       >
  //         {({ registerChild }) => (
  //           <div style={style} ref={registerChild}>
  //             {cellRenderer(params)}
  //           </div>
  //         )}
  //       </CellMeasurer>
  //     );
  //   },
  //   [items, cellRenderer, columnCount, _cache, hasCache],
  // );

  const observer = useRef();

  const lastDocumentRef = useCallback((node) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadMore]);

  return (
    <Styled.GridContainer {...otherProps} $columnCount={columnCount}>
      {items.map(cellRenderer(lastDocumentRef))}
      {isLoadingMore && Array(loadingItemCount).fill().map((_, index) => (
        <DocumentGridItemSkeleton key={index} />
      ))}
    </Styled.GridContainer>
  //   <InfiniteLoader
  //     isRowLoaded={_isRowLoaded}
  //     loadMoreRows={loadMore}
  //     rowCount={rowCount}
  //     threshold={2}
  //     minimumBatchSize={9}
  //   >
  //     {({ onRowsRendered, registerChild }) => (
  //       <WindowScroller ref={_windowScrollerRef}>
  //         {({
  //           height, isScrolling, onChildScroll, scrollTop,
  //         }) => (
  //           <AutoSizer disableHeight>
  //             {({ width }) => (
  //               <Grid
  //                 autoContainerWidth
  //                 ref={registerChild}
  //                 height={height}
  //                 width={width}
  //                 autoHeight
  //                 isScrolling={isScrolling}
  //                 onSectionRendered={({
  //                   rowStartIndex, rowStopIndex,
  //                 }) => {
  //                   onRowsRendered({
  //                     startIndex: rowStartIndex,
  //                     stopIndex: rowStopIndex,
  //                   });
  //                 }}
  //                 onScroll={onChildScroll}
  //                 scrollTop={scrollTop}
  //                 overscanRowCount={2}
  //                 cellRenderer={_cellRendererHOC}
  //                 rowCount={rowCount}
  //                 columnWidth={width / columnCount}
  //                 columnCount={columnCount}
  //                 rowHeight={_cache.rowHeight}
  //                 {...otherProps}
  //               />
  //             )}
  //           </AutoSizer>
  //         )}
  //       </WindowScroller>
  //     )}
  //   </InfiniteLoader>
  );
}

VirtualizedGrid.propTypes = {
  cellRenderer: PropTypes.func.isRequired,
  loadMore: PropTypes.func,
  items: PropTypes.array.isRequired,
  loadingItemCount: PropTypes.number,
  rowCount: PropTypes.number,
  columnCount: PropTypes.number,
  hasCache: PropTypes.bool,
  isLoadingMore: PropTypes.bool,
};
VirtualizedGrid.defaultProps = {
  loadMore: () => {},
  loadingItemCount: 0,
  rowCount: 0,
  columnCount: 5,
  hasCache: false,
  isLoadingMore: false,
};

export default React.memo(VirtualizedGrid);
