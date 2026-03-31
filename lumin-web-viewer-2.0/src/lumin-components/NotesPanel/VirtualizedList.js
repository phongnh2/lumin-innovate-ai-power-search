import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  useCallback
} from 'react';
import Measure from 'react-measure';
import { CellMeasurer, CellMeasurerCache, List } from 'react-virtualized';

import { TIMEOUT } from 'constants/lumin-common';

const propTypes = {
  notes: PropTypes.array.isRequired,
  children: PropTypes.func.isRequired,
  onScroll: PropTypes.func.isRequired,
  initialScrollTop: PropTypes.number.isRequired,
  selectedIndex: PropTypes.number,
  sortStrategy: PropTypes.string,
};

const defaultProps = {
  selectedIndex: -1,
  sortStrategy: 'position',
};

const cache = new CellMeasurerCache({ defaultHeight: 86, fixedWidth: true });

const VirtualizedList = React.forwardRef((props, forwardedRef) => {
  const { notes, children, onScroll, initialScrollTop, selectedIndex, sortStrategy } = props;

    const listRef = useRef();
    const [offset, setOffset] = useState(0);
    const [dimension, setDimension] = useState({ width: 0, height: 0 });
    let prevWindowHeight = window.innerHeight;

  const forceUpdateGrid = useCallback(
    debounce(() => {
      if (!listRef.current) {
        return;
      }
      listRef.current.forceUpdateGrid();
    }, TIMEOUT.MEASURE_GRIDVIEW_ROWS),
    []
  );

  const measureAllRows = () => {
    if (!listRef.current) {
      return;
    }
    cache.clearAll();
    listRef.current.measureAllRows();
  };

  const recomputeRowHeights = (index) => {
    if (!listRef.current) {
      return;
    }
    cache.clear(index);
    listRef.current.recomputeRowHeights(index);
  };

  const onForceUpdateGrid = () => {
    measureAllRows();
    forceUpdateGrid();
  };

  useImperativeHandle(forwardedRef, () => ({
    scrollToPosition: (scrollTop) => {
      listRef.current.scrollToPosition(scrollTop);
    },
    scrollToRow: (index) => {
      listRef.current.scrollToRow(index);
    },
    onForceUpdateGrid,
  }));

    useEffect(() => {
      listRef.current.scrollToPosition(initialScrollTop);
    }, [initialScrollTop]);

    useEffect(() => {
      measureAllRows();
      if (selectedIndex !== -1) {
        listRef.current?.scrollToRow(selectedIndex);
      }
    }, [selectedIndex]);

    useEffect(() => {
      onForceUpdateGrid();
      return () => {
        forceUpdateGrid.cancel();
      };
    }, [notes.length, sortStrategy]);

    useEffect(() => {
      const windowResizeHandler = () => {
        const diff = window.innerHeight - prevWindowHeight;
        if (diff) {
          // List height never resizes down after exiting fullscreen
          if (window.innerHeight < prevWindowHeight) {
            setOffset(diff);
          }
          prevWindowHeight = window.innerHeight;
        }
      };
      window.addEventListener('resize', windowResizeHandler);

      return () => {
        window.removeEventListener('resize', windowResizeHandler);
      };
    });

    const _resize = (index) => {
      recomputeRowHeights(index);
    };

    const handleScroll = ({ scrollTop }) => {
      onScroll(scrollTop);
    };

    const rowRenderer = ({
      index, key, parent, style,
    }) => {
      const currNote = notes[index];

      // Padding added to the right since virtualized list lets it get cut off on the right
      return (
        <CellMeasurer key={`${key}${currNote.Id}`} cache={cache} columnIndex={0} parent={parent} rowIndex={index}>
          {({ measure }) => (
            <div style={{ ...style, paddingRight: 12 }}>
              {children({
                notes,
                index,
                resize: () => {
                  _resize(index);
                  measure();
                },
              })}
            </div>
          )}
        </CellMeasurer>
      );
    };

    return (
      <Measure
        bounds
        offset
        onResize={({ bounds }) => {
          setDimension({
            ...bounds,
            // Override height and compensate for extra size
            height: bounds.height + offset * 2,
          });
          setOffset(0);
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef} className="virtualized-notes-container">
            <List
              deferredMeasurementCache={cache}
              style={{ outline: 'none' }}
              height={dimension.height - offset}
              width={dimension.width}
              overscanRowCount={10}
              ref={listRef}
              rowCount={notes.length}
              rowHeight={cache.rowHeight}
              rowRenderer={rowRenderer}
              onScroll={handleScroll}
            />
          </div>
        )}
      </Measure>
    );
  },
);

VirtualizedList.propTypes = propTypes;
VirtualizedList.defaultProps = defaultProps;

export default React.memo(VirtualizedList);
