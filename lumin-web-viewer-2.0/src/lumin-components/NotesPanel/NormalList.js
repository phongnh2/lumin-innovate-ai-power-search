import PropTypes from 'prop-types';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

const NormalList = React.forwardRef(({ notes, children, onScroll, initialScrollTop }, forwardedRef) => {
  const [listRef, setListRef] = useState(null);

  useImperativeHandle(forwardedRef, () => ({
    scrollToPosition: (scrollTop) => {
      if (listRef) {
        listRef.scrollTop = scrollTop;
      }
    },
    children: () => listRef,
    scrollToRow: (index) => {
      const parent = listRef;
      const child = parent.children[index];

      const parentRect = parent.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();

      const isViewable = childRect.top >= parentRect.top && childRect.top <= parentRect.top + parent.clientHeight;
      if (!isViewable) {
        parent.scrollTop = childRect.top + parent.scrollTop - parentRect.top;
      }
    },
  }));

  useEffect(() => {
    if (listRef) {
      listRef.scrollTop = initialScrollTop;
    }
  }, [initialScrollTop, listRef]);

  const handleScroll = (e) => {
    onScroll(e.target.scrollTop);
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <div
          className="custom-scrollbar-reskin"
          style={{ height, width, overflowY: 'auto' }}
          ref={setListRef}
          onScroll={handleScroll}
        >
          {notes.map((currNote, index) => (
            <React.Fragment key={`${index}${currNote.Id}`}>{children({ notes, index })}</React.Fragment>
          ))}
        </div>
      )}
    </AutoSizer>
  );
});

NormalList.propTypes = {
  notes: PropTypes.array.isRequired,
  children: PropTypes.func.isRequired,
  onScroll: PropTypes.func.isRequired,
  initialScrollTop: PropTypes.number.isRequired,
};

export default React.memo(NormalList);
