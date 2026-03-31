import { useCallback, useContext, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { DocumentContext } from 'luminComponents/Document/context';

import { ItemTypes } from 'constants/documentConstants';
import { CHECKBOX_TYPE } from 'constants/lumin-common';

export function useDragDropDocument({ document }) {
  const { _id: documentId } = document || {};
  const { selectedDocList, setDraggingDoc, handleSelectedItems, lastSelectedDocIdRef } = useContext(DocumentContext);
  const selectedDocIds = selectedDocList.map((_item) => _item._id);

  const onCollect = useCallback(
    (monitor) => ({ isDragging: Boolean(monitor.isDragging()) }),
    [],
  );
  const isDragging = useCallback(
    (monitor) => documentId === monitor.getItem().itemRender._id,
    [documentId],
  );

  const getItemRender = () => {
    if (selectedDocIds.length) {
      return selectedDocIds.includes(document._id) ? document : selectedDocList[0];
    }

    return document;
  };

  const [collected, drag, preview] = useDrag(
    () => ({
      item: {
        itemRender: getItemRender(),
      },
      type: ItemTypes.DOCUMENT,
      isDragging,
      collect: onCollect,
    }),
    [document, selectedDocList],
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  useEffect(() => {
    setDraggingDoc(collected.isDragging);
    if (collected.isDragging && !selectedDocIds.length) {
      handleSelectedItems({
        currentItem: document,
        lastSelectedDocId: lastSelectedDocIdRef.current,
        checkboxType: CHECKBOX_TYPE.SELECT,
      });
    }
  }, [collected.isDragging]);

  const docDragging = collected.isDragging ? getItemRender() : '';

  return { docDragging, dragRef: drag };
}
