import React, { useRef, useCallback, useImperativeHandle } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Virtuoso as List, VirtuosoHandle } from 'react-virtuoso';

import * as Styled from './NoteVirtualizedList.styled';

const defaultProps = {
  selectedIndex: -1,
};

interface INoteVirtualizedListProps {
  notes: any[];
  children: (props: unknown) => React.ReactNode;
  onScroll: (scrollY: number) => void;
  selectedIndex?: number;
}

const NoteVirtualizedList = React.forwardRef((props: INoteVirtualizedListProps, forwardedRef) => {
  const { notes, children, onScroll, selectedIndex } = props;

  const listRef = useRef<VirtuosoHandle | null>(null);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      onScroll(event.currentTarget.scrollTop);
    },
    [onScroll]
  );

  const scrollToItemByIndex = useCallback((index: number) => {
    listRef?.current?.scrollToIndex({ index, align: 'center' });
  }, []);

  const renderRows = useCallback(
    (index: number) => children({ notes, index, isSelected: selectedIndex === index }),
    [children, notes, selectedIndex]
  );

  const getListStyle = useCallback(
    ({ width, height }: { width: number; height: number }) => ({
      width: Math.round(width),
      height: Math.round(height),
    }),
    []
  );

  useImperativeHandle(forwardedRef, () => ({
    scrollToRow: scrollToItemByIndex,
  }));

  return (
    <Styled.VirtualizedWrapper className="custom-scrollbar-reskin">
      <AutoSizer>
        {({ height, width }: { width: number; height: number }) => (
          <List
            totalCount={notes.length}
            style={getListStyle({ width, height })}
            ref={listRef}
            onScroll={handleScroll}
            itemContent={renderRows}
            increaseViewportBy={300}
            overscan={300}
          />
        )}
      </AutoSizer>
    </Styled.VirtualizedWrapper>
  );
});

NoteVirtualizedList.defaultProps = defaultProps;

export default React.memo(NoteVirtualizedList);
