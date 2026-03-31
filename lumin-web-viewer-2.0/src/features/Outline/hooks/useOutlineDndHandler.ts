import { RefObject, useEffect, useState } from 'react';
import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import core from 'core';

import { isIE } from 'helpers/device';

import { BUFFER_ROOM, DropLocation, ItemTypes } from 'constants/react-dnd';

import { TOutlineNode } from '../types';
import { DragItem } from '../types/dragItem';

const checkIfOutlineIsChild = (dragOutline: TOutlineNode, dropOutline: TOutlineNode): boolean => {
  if (dragOutline.pathId === dropOutline.pathId) {
    return true;
  }

  if (dragOutline.children) {
    return dragOutline.children.some((child) => checkIfOutlineIsChild(child, dropOutline));
  }

  return false;
};

export const useOutlineDndHandler = ({
  outline,
  elementRef,
  moveOutlineInward,
  moveOutlineBeforeTarget,
  moveOutlineAfterTarget,
  forceDropBelowTarget = false,
  isDraggable = true,
  canModifyOutline,
}: {
  outline: TOutlineNode;
  elementRef: RefObject<HTMLDivElement>;
  moveOutlineInward: (args: { dragOutline: TOutlineNode; dropOutline: TOutlineNode }) => void;
  moveOutlineBeforeTarget: (args: { dragOutline: TOutlineNode; dropOutline: TOutlineNode }) => void;
  moveOutlineAfterTarget: (args: { dragOutline: TOutlineNode; dropOutline: TOutlineNode }) => void;
  forceDropBelowTarget?: boolean;
  isDraggable?: boolean;
  canModifyOutline: boolean;
}) => {
  const [isNesting, setIsNesting] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.Outline,
    item: { outline, elementRef } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => {
      if (!canModifyOutline || !isDraggable) {
        return false;
      }
      if (isIE) {
        console.warn('Drag and drop outlines for IE11 is not supported');
        return false;
      }
      if (!core.isFullPDFEnabled()) {
        console.warn('Full API must be enabled to drag and drop outlines');
        return false;
      }
      return true;
    },
  });

  const [{ isDraggedUpwards, isDraggedDownwards, isOver }, drop] = useDrop({
    accept: ItemTypes.Outline,
    hover(item: DragItem, monitor) {
      const dragOutline = item.outline;
      const dropOutline = outline;

      const isChild = checkIfOutlineIsChild(dragOutline, dropOutline);
      if (dragOutline.pathId === dropOutline.pathId || isChild) {
        item.dropLocation = undefined;
        return;
      }

      const hoverBoundingRect = elementRef.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      let newDropLocation = DropLocation.INITIAL;
      if (hoverClientY <= hoverMiddleY + BUFFER_ROOM && hoverClientY >= hoverMiddleY - BUFFER_ROOM) {
        newDropLocation = DropLocation.ON_TARGET_HORIZONTAL_MIDPOINT;
      } else if (hoverClientY > hoverMiddleY + BUFFER_ROOM) {
        newDropLocation = DropLocation.BELOW_TARGET;
      } else if (hoverClientY < hoverMiddleY - BUFFER_ROOM) {
        newDropLocation = DropLocation.ABOVE_TARGET;
      }

      if (newDropLocation === DropLocation.ON_TARGET_HORIZONTAL_MIDPOINT) {
        setIsNesting(true);
      } else {
        setIsNesting(false);
      }
      item.dropLocation = newDropLocation;
    },
    drop(item: DragItem) {
      if (!item.dropLocation) {
        return;
      }

      const dragOutline = item.outline;
      const dropOutline = outline;

      if (forceDropBelowTarget) {
        item.dropLocation = DropLocation.BELOW_TARGET;
      }

      switch (item.dropLocation) {
        case DropLocation.ON_TARGET_HORIZONTAL_MIDPOINT:
          moveOutlineInward({ dragOutline, dropOutline });
          break;
        case DropLocation.ABOVE_TARGET:
          moveOutlineBeforeTarget({ dragOutline, dropOutline });
          break;
        case DropLocation.BELOW_TARGET:
          moveOutlineAfterTarget({ dragOutline, dropOutline });
          break;
        default:
          break;
      }

      setIsNesting(false);
      item.dropLocation = DropLocation.INITIAL;
    },
    collect: (monitor: DropTargetMonitor<DragItem>) => ({
      isDraggedUpwards:
        monitor.isOver({ shallow: true }) && monitor.getItem()?.dropLocation === DropLocation.ABOVE_TARGET,
      isDraggedDownwards:
        monitor.isOver({ shallow: true }) && monitor.getItem()?.dropLocation === DropLocation.BELOW_TARGET,
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  return { drag, isDragging, drop, isDraggedUpwards, isDraggedDownwards, isNesting: isOver && isNesting, isOver };
};
