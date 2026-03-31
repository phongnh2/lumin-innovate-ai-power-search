import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

function VirtualizedList({
  items, rowRenderer, rowCount, loadMore, ...otherProps
}) {
  // const _windowScrollerRef = useRef(null);

  // const _isRowLoaded = ({ index }) => !!items[index];

  // const _rowRendererHOC = useCallback((params) => {
  //   if (items[params.index]) {
  //     return rowRenderer(params);
  //   }
  //   // return <div key={params.key}>{`loading ${params.index}`}</div>;
  //   return null;
  // }, [items, rowRenderer]);

  // let numberOfRows = rowCount || items.length;
  // if (hasNext) {
  //   numberOfRows += 1;
  // }

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
    <div {...otherProps}>
      {items.map(rowRenderer(lastDocumentRef))}
    </div>
  // <InfiniteLoader
  //   isRowLoaded={_isRowLoaded}
  //   loadMoreRows={loadMore}
  //   rowCount={numberOfRows}
  //   threshold={5}
  //   minimumBatchSize={9}
  // >
  //   {({ onRowsRendered, registerChild: refInfinite }) => (
  //     <WindowScroller
  //       ref={_windowScrollerRef}
  //     >
  //       {({
  //         height, isScrolling, onChildScroll, scrollTop,
  //       }) => (
  //         <AutoSizer disableHeight>
  //           {({ width }) => (
  //             <List
  //               ref={refInfinite}
  //               height={height}
  //               width={width}
  //               autoHeight
  //               isScrolling={isScrolling}
  //               onRowsRendered={onRowsRendered}
  //               onScroll={onChildScroll}
  //               scrollTop={scrollTop}
  //               rowRenderer={_rowRendererHOC}
  //               overscanRowCount={5}
  //               rowCount={numberOfRows}
  //               {...otherProps}
  //             />
  //           )}
  //         </AutoSizer>
  //       )}
  //     </WindowScroller>
  //   )}
  // </InfiniteLoader>
  );
}

VirtualizedList.propTypes = {
  rowRenderer: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  rowCount: PropTypes.number,
  // hasNext: PropTypes.bool.isRequired,
};
VirtualizedList.defaultProps = {
  rowCount: 0,
};

export default React.memo(VirtualizedList);
