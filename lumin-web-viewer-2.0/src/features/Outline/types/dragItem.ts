import { RefObject } from 'react';

import { DropLocation } from 'constants/react-dnd';

import { TOutlineNode } from './tree-node';

export interface DragItem {
  outline: TOutlineNode;
  elementRef: RefObject<HTMLDivElement>;
  dropLocation?: DropLocation;
}
