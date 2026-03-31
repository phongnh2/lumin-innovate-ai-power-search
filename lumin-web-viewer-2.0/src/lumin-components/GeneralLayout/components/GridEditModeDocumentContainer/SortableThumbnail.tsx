import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React, { useMemo } from 'react';

import styles from './SortableThumbnail.module.scss';

export enum SortablePosition {
  Before = 'before',
  After = 'after',
}

interface SortableThumbnailProps {
  activeIndex: number;
  children: React.ReactNode;
  style: React.CSSProperties;
  pageIndex: UniqueIdentifier;
  isFirstItemOfRow: boolean;
}

const SortableThumbnail = ({ pageIndex, style, children, activeIndex, isFirstItemOfRow }: SortableThumbnailProps) => {
  const { index, over, attributes, listeners, transform, transition, isSorting, isDragging, setNodeRef } = useSortable({
    id: pageIndex,
    animateLayoutChanges: () => true,
  });

  const sortableStyle = {
    ...style,
    transition,
    transform: isSorting ? undefined : CSS.Translate.toString(transform),
  };

  const insertPosition = useMemo(() => {
    if (over?.id === pageIndex) {
      return index > activeIndex ? SortablePosition.After : SortablePosition.Before;
    }
    return undefined;
  }, [over?.id, activeIndex, index, pageIndex]);

  return (
    <div
      ref={setNodeRef}
      className={classNames(
        styles.sortableThumbnail,
        isDragging && styles.dragging,
        isFirstItemOfRow && styles.firstItemOfRow,
        insertPosition === SortablePosition.Before && styles.insertBefore,
        insertPosition === SortablePosition.After && styles.insertAfter
      )}
      style={sortableStyle}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

export default SortableThumbnail;
