import React, { useCallback, useContext, useMemo } from 'react';
import { useDragLayer } from 'react-dnd';

import { DocumentContext } from 'lumin-components/Document/context';
import { ItemTypes, DOCUMENT_DRAG_WITHOUT_SELECT } from 'constants/documentConstants';
import DocumentDragPreview from './helper/DocumentDragPreview';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
};

const getItemStyles = (data) => {
  const { initialOffset, currentOffset, clientOffset } = data;
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }
  const { x, y } = clientOffset;
  const transform = `translate3d(${x - 50}px, ${y - 70}px, 0)`;
  return {
    transform,
    WebkitTransform: transform,
  };
};

export default function DocumentDragLayer() {
  const {
    itemType,
    isDragging,
    initialOffset,
    item,
    currentOffset,
    clientOffset,
  } = useDragLayer(
    (monitor) => ({
      clientOffset: monitor.getClientOffset(),
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }),
  );

  const { selectedDocList } = useContext(DocumentContext);

  const renderItem = useCallback(({ type, item: _item }) => {
    if (type === ItemTypes.DOCUMENT) {
      return <DocumentDragPreview document={_item.itemRender} countMoveFile={selectedDocList.length || DOCUMENT_DRAG_WITHOUT_SELECT} />;
    }
    return null;
  }, [selectedDocList]);

  const dragOffset = useMemo(() => ({
    initialOffset, currentOffset, clientOffset,
  }), [clientOffset, currentOffset, initialOffset]);

  const itemStyle = useMemo(() => getItemStyles(dragOffset), [dragOffset]);

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={itemStyle}>
        {renderItem({ type: itemType, item })}
      </div>
    </div>
  );
}
