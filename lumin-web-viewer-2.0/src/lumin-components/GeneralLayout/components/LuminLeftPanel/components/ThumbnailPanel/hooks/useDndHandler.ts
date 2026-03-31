import { DroppableProvided, DropResult } from '@hello-pangea/dnd';
import { useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';

import core from 'core';

import usePagetoolActionFromThumbnail from './usePagetoolActionFromThumbnail';

export type ThumbnailData = {
  id: string;
  width: number;
  height: number;
};

export const useDndHandler = () => {
  const { movePage } = usePagetoolActionFromThumbnail();
  const listRef = useRef<HTMLDivElement>(null);
  const setListRef = useCallback(
    (droppableProvided: DroppableProvided) => (ref: HTMLDivElement) => {
      if (ref) {
        listRef.current = ref;
        // eslint-disable-next-line react/no-find-dom-node
        const listDomRef = ReactDOM.findDOMNode(ref);
        if (listDomRef instanceof HTMLElement) {
          droppableProvided.innerRef(listDomRef);
        }
      }
    },
    []
  );

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source } = result;
      if (!destination || !source) {
        return;
      }
      const { index: destinationIndex } = destination;
      const { index: sourceIndex } = source;
      await movePage(sourceIndex + 1, destinationIndex + 1);
      core.setCurrentPage(destinationIndex + 1);
    },
    [movePage]
  );

  return {
    listRef,
    setListRef,
    onDragEnd,
  };
};
