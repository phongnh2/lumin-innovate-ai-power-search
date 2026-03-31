import { DragEndEvent } from '@dnd-kit/core';

export type Thumb = {
  className: string;
  pageIndex: number;
  id: string;
  src: HTMLCanvasElement;
  width: number;
  height: number;
};

export type ThumbnailCanvasProps = {
  thumb: Thumb;
  newlyPagesAdded: (number | string)[];
  canvasStyle: React.CSSProperties;
  isDragging: boolean;
};

export type DragEndHandlerProps = {
  event: DragEndEvent;
  thumbsAndSkeletons: Thumb[];
  updateThumbs: (thumbs: Thumb[]) => void;
};
