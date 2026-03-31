import { differenceWith, find } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useEvent } from 'react-use';

import selectors from 'selectors';

import { DOCUMENT_OFFLINE_STATUS } from 'constants/documentConstants';
import { CHECKBOX_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

import ArrowDownHandler from './helpers/ArrowDownHandler';
import ArrowUpHandler from './helpers/ArrowUpHandler';
import getCursorPosition from './helpers/getCursorPosition';
import preventUseShortKey from '../useSelectDocuments/helpers/preventUseShortKey';

const isOfflineDocItem = (item: IDocumentBase & { offlineStatus: string }) =>
  item.offlineStatus === DOCUMENT_OFFLINE_STATUS.AVAILABLE;

type SelectItemsProps = {
  setRemoveDocList: (args: { data?: IDocumentBase[]; type: string }) => void;
  documentList: IDocumentBase[];
  selectedDocList: IDocumentBase[];
  folderList: IFolder[];
  selectedFolders: IFolder[];
  setRemoveFolderList: (args: { data?: IFolder[]; type: string }) => void;
};

export type IItem = IFolder | IDocumentBase;

export type HandleSelectedItems = {
  currentItem: IItem;
  lastSelectedDocId: string;
  checkboxType: string;
};
// This hook was use to multi select in document list reskin
// eslint-disable-next-line sonarjs/cognitive-complexity
export function useSelectItems({
  setRemoveDocList,
  documentList,
  selectedDocList,
  folderList,
  selectedFolders,
  setRemoveFolderList,
}: SelectItemsProps) {
  const lastSelectedDocIdRef = useRef<string>(null);
  const temporarySelectItemsRef = useRef<(IFolder | IDocumentBase)[]>([]);
  const shiftHoldingRef = useRef(false);
  const documentListRef = useRef(documentList);
  const folderListRef = useRef(folderList);
  const isOffline = useSelector(selectors.isOffline);
  const activeDocumentList = useMemo(
    () => (isOffline ? documentList.filter(isOfflineDocItem) : documentList),
    [documentList, isOffline]
  );
  const activeItems = useMemo(() => [...folderList, ...activeDocumentList], [activeDocumentList, folderList]);
  const activeItemsRef = useRef(activeItems);
  const activeDocumentListRef = useRef(activeDocumentList);

  const handleShiftPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      return;
    }

    if (e.type === 'keydown') {
      shiftHoldingRef.current = e.key === 'Shift';
    } else if (e.type === 'keyup' && e.key === 'Shift') {
      shiftHoldingRef.current = false;
    }
  };

  const handlePressEsc = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape' || preventUseShortKey()) {
      return;
    }
    if (selectedDocList.length) {
      setRemoveDocList({
        type: CHECKBOX_TYPE.DELETE,
      });
    }
    if (selectedFolders.length) {
      setRemoveFolderList({
        type: CHECKBOX_TYPE.DELETE,
      });
    }
  };

  const handleSelectAll = (e: React.KeyboardEvent) => {
    if (!((e.metaKey || e.ctrlKey) && e.key === 'a') || preventUseShortKey()) {
      return;
    }
    e.preventDefault();
    setRemoveDocList({
      data: activeDocumentListRef.current,
      type: CHECKBOX_TYPE.ALL,
    });
    setRemoveFolderList({
      data: folderListRef.current,
      type: CHECKBOX_TYPE.ALL,
    });
  };

  const splitFoldersAndDocuments = (
    items: (IDocumentBase | IFolder)[]
  ): {
    folders: IFolder[];
    documents: IDocumentBase[];
  } => {
    const folderIds = folderListRef.current.map((folder) => folder._id);
    const { folders, documents } = items.reduce(
      (acc, item) => {
        if (folderIds.includes(item._id)) {
          acc.folders.push(item as IFolder);
        } else {
          acc.documents.push(item as IDocumentBase);
        }
        return acc;
      },
      { folders: [], documents: [] }
    );
    return { folders, documents };
  };

  const handleSelectedItems = useCallback(({ currentItem, lastSelectedDocId, checkboxType }: HandleSelectedItems) => {
    const holdingShift = shiftHoldingRef.current;
    if (holdingShift && lastSelectedDocId) {
      // determined start/end position
      const { start, end } = getCursorPosition({
        items: activeItemsRef.current,
        currentItemId: currentItem._id,
        lastSelectedDocId,
      });

      // there are 2 itemId. we need to find items between them
      const selectedItems = activeItemsRef.current.slice(start, end + 1);

      // from now: determined checkboxType by
      // If: currentItem in temporarySelectDocs => Deselect others and keep from lastSelectedDocId to currentItem
      const temporarySelectDocs = temporarySelectItemsRef.current;
      let computedCheckboxType = checkboxType;
      if (temporarySelectDocs.length) {
        const deselectList = differenceWith(
          temporarySelectDocs,
          selectedItems,
          (origin, peer) => origin._id === peer._id
        );
        const isBetween = find(temporarySelectDocs, { _id: currentItem._id });
        if (isBetween) {
          computedCheckboxType = CHECKBOX_TYPE.SELECT;
        }
        const { folders: deselectFolders, documents: deselectDocuments } = splitFoldersAndDocuments(deselectList);
        setRemoveDocList({
          data: deselectDocuments,
          type: CHECKBOX_TYPE.DESELECT,
        });
        setRemoveFolderList({
          data: deselectFolders,
          type: CHECKBOX_TYPE.DESELECT,
        });
      }
      const { folders: selectFolders, documents: selectedDocuments } = splitFoldersAndDocuments(selectedItems);
      setRemoveDocList({
        data: selectedDocuments,
        type: computedCheckboxType,
      });
      setRemoveFolderList({
        data: selectFolders,
        type: computedCheckboxType,
      });
      // Update temporary selected docs
      temporarySelectItemsRef.current = selectedItems;
    }
    if (!holdingShift) {
      temporarySelectItemsRef.current = [];
      const folderIds = folderListRef.current.map((folder) => folder._id);
      if (checkboxType === CHECKBOX_TYPE.SELECT_ONE) {
        if (folderIds.includes(currentItem._id)) {
          setRemoveFolderList({ data: [currentItem as IFolder], type: checkboxType });
          setRemoveDocList({ data: [currentItem as IDocumentBase], type: CHECKBOX_TYPE.DELETE });
          return;
        }
        setRemoveDocList({ data: [currentItem as IDocumentBase], type: checkboxType });
        setRemoveFolderList({ data: [currentItem as IFolder], type: CHECKBOX_TYPE.DELETE });
        return;
      }
      if (folderIds.includes(currentItem._id)) {
        setRemoveFolderList({ data: [currentItem as IFolder], type: checkboxType });
        return;
      }
      setRemoveDocList({ data: [currentItem as IDocumentBase], type: checkboxType });
    }
  }, []);

  const getArrowHandlerParams = () => ({
    tempSelected: temporarySelectItemsRef.current,
    lastSelectedDocId: lastSelectedDocIdRef.current,
    handleSelectedItems,
    itemList: activeItemsRef.current,
  });

  const handlePressArrow = (e: React.KeyboardEvent) => {
    if (!(selectedDocList.length || selectedFolders.length) || preventUseShortKey() || !e.shiftKey) {
      return;
    }
    switch (e.key) {
      case 'ArrowDown': {
        const arrowDownHandler = new ArrowDownHandler(getArrowHandlerParams());
        arrowDownHandler.exec();
        break;
      }
      case 'ArrowUp': {
        const arrowUpHandler = new ArrowUpHandler(getArrowHandlerParams());
        arrowUpHandler.exec();
        break;
      }
      default:
        break;
    }
  };

  useEvent(
    'keydown',

    (e: React.KeyboardEvent) => {
      handleShiftPress(e);
      handleSelectAll(e);
      handlePressEsc(e);
      handlePressArrow(e);
    }
  );

  useEvent(
    'keyup',

    (e: React.KeyboardEvent) => {
      handleShiftPress(e);
    }
  );

  useEffect(() => {
    documentListRef.current = documentList;
  }, [documentList]);

  useEffect(() => {
    activeDocumentListRef.current = activeDocumentList;
  }, [activeDocumentList]);

  useEffect(() => {
    folderListRef.current = folderList;
  }, [folderList]);

  useEffect(() => {
    activeItemsRef.current = activeItems;
  }, [activeItems]);

  return {
    lastSelectedDocIdRef,
    handleSelectedItems,
    shiftHoldingRef,
  };
}
