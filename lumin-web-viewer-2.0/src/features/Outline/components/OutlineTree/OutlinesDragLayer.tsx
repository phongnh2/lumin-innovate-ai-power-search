import React from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';

import Icomoon from 'luminComponents/Icomoon';

import { DragItem } from 'features/Outline/types';

import { ItemTypes } from 'constants/react-dnd';

import * as Styled from '../OutlinePanel.styled';

const getItemStyles = (initialOffset: XYCoord | null, currentOffset: XYCoord | null) => {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }
  const { x, y } = currentOffset;
  const transform = `translate(calc(${x}px), calc(${y}px))`;
  return {
    transform,
    WebkitTransform: transform,
  };
};

const OutlinesDragLayer = () => {
  const { itemType, item, isDragging, initialOffset, currentOffset } = useDragLayer((dragLayerState) => ({
    itemType: dragLayerState.getItemType(),
    item: dragLayerState.getItem() as DragItem,
    isDragging: dragLayerState.isDragging(),
    initialOffset: dragLayerState.getInitialSourceClientOffset(),
    currentOffset: dragLayerState.getClientOffset(),
  }));

  if (!isDragging || !item || itemType !== ItemTypes.Outline) {
    return null;
  }

  return (
    <Styled.OutlinePreviewContainer>
      <Styled.OutlinePreviewLayer style={getItemStyles(initialOffset, currentOffset)}>
        {item.outline.children.length > 0 && (
          <Styled.IconWrapper $open={false}>
            <Icomoon className="sm_right_stroke" size={16} />
          </Styled.IconWrapper>
        )}
        <Styled.ListItemContent>{item.outline.name}</Styled.ListItemContent>
      </Styled.OutlinePreviewLayer>
    </Styled.OutlinePreviewContainer>
  );
};

export default OutlinesDragLayer;
