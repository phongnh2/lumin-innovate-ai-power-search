import {
  closestCenter,
  DragStartEvent,
  MeasuringConfiguration,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';

import fireEvent from 'helpers/fireEvent';

import { CUSTOM_EVENT } from 'constants/customEvent';

import { DragEndHandlerProps } from '../types';

export const useSortableThumbnail = () => {
  const [sortableThumbnailId, setSortableThumbnailId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const measuring: MeasuringConfiguration = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    },
  };

  const onDragStart = (event: DragStartEvent) => {
    setSortableThumbnailId(event.active.id);
  };

  const onDragCancel = () => {
    setSortableThumbnailId(null);
  };

  const onDragEnd = ({ event, thumbsAndSkeletons, updateThumbs }: DragEndHandlerProps) => {
    const overId = event.over?.id;
    if (overId != null && sortableThumbnailId != null && overId !== sortableThumbnailId) {
      const currentIndex = thumbsAndSkeletons.indexOf(
        thumbsAndSkeletons.find((item) => item.pageIndex === sortableThumbnailId)
      );
      const dropPageIndex = thumbsAndSkeletons.indexOf(thumbsAndSkeletons.find((item) => item.pageIndex === overId));
      fireEvent(CUSTOM_EVENT.ON_DRAG_END_THUMBNAIL_PAGE_TOOL, {
        dropPageIndex: dropPageIndex + 1,
        currentPageIndex: currentIndex,
      });

      const newThumbs = [...thumbsAndSkeletons];
      const [movingPage] = newThumbs.splice(currentIndex, 1);
      newThumbs.splice(dropPageIndex, 0, movingPage);
      updateThumbs(newThumbs);
    }
    setSortableThumbnailId(null);
  };

  return {
    sensors,
    measuring,
    sortableThumbnailId,
    collision: closestCenter,
    onDragCancel,
    onDragStart,
    onDragEnd,
  };
};
