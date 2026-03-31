import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { compose } from 'redux';

import { DocumentContext } from 'lumin-components/Document/context';
import DocumentList from 'lumin-components/DocumentList';
import { useDocumentSelectionStore } from 'luminComponents/Document/hooks/useDocumentSelectionStore';
import DocumentDragLayer from 'luminComponents/Shared/DocumentDragLayer';

import withDragMoveDoc from 'HOC/withDragMoveDoc';

import { useSelectItems } from 'hooks/useSelectItems';

import { documentServices } from 'services';

import { layoutType } from 'constants/documentConstants';
import { CHECKBOX_TYPE } from 'constants/lumin-common';

function FolderDocumentList({
  searchKey,
  documentList,
  hasNextPage,
  total,
  fetchMore,
  refetch,
  setDocumentList,
  error,
  folder,
  folderList = [],
  folderLoading,
  documentLoading,
}) {
  const [documentLayout, setDocumentLayout] = useState(layoutType.list);
  const [selectedDocList, setSelectedDocList] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [selectDocMode, setSelectDocMode] = useState([]);
  const [isDeleting, setDeletingDoc] = useState(false);
  const [isMoving, setMovingDoc] = useState(false);
  const [isDragging, setDraggingDoc] = useState(false);
  const { folderId } = useParams();
  const { setSelectedDocuments } = useDocumentSelectionStore();

  const setRemoveDocList = useCallback(({ data = [], type = CHECKBOX_TYPE.SELECT }) => {
    setSelectedDocList((prevSelectedList) =>
      documentServices.setSelectedList({ selectedList: prevSelectedList, data, type })
    );
  }, []);

  const setRemoveFolderList = useCallback(({ data = {}, type = CHECKBOX_TYPE.SELECT }) => {
    setSelectedFolders((prevSelectedList) =>
      documentServices.setSelectedList({ selectedList: prevSelectedList, data, type })
    );
  }, []);

  const {
    lastSelectedDocIdRef: lastSelectedItemIdRef,
    handleSelectedItems,
    shiftHoldingRef: shiftHoldingItemRef,
  } = useSelectItems({
    setRemoveDocList,
    documentList,
    selectedDocList,
    folderList,
    setRemoveFolderList,
    selectedFolders,
  });

  useEffect(() => {
    if (searchKey && documentLayout === layoutType.grid) {
      setDocumentLayout(layoutType.list);
    }
  }, [searchKey]);

  useEffect(
    () => () => {
      setSelectedDocList([]);
      setSelectedFolders([]);
      setSelectDocMode(false);
      setMovingDoc(false);
      setDeletingDoc(false);
    },
    [folderId]
  );

  useEffect(() => {
    setSelectedDocuments(selectedDocList);
  }, [selectedDocList, setSelectedDocuments]);

  const documentContext = useMemo(
    () => ({
      documentLayout,
      setDocumentLayout,
      selectedDocList,
      selectDocMode,
      isMoving,
      isDeleting,
      setRemoveDocList,
      setSelectDocMode,
      setIsMoving: setMovingDoc,
      setIsDeleting: setDeletingDoc,
      lastSelectedDocIdRef: lastSelectedItemIdRef,
      shiftHoldingRef: shiftHoldingItemRef,
      setDocumentList,
      totalDocInFolder: total,
      refetchDocument: refetch,
      error,
      handleSelectedItems,
      selectedFolders,
      isDragging,
      setDraggingDoc,
      setRemoveFolderList,
    }),
    [
      documentLayout,
      setDocumentLayout,
      selectedDocList,
      selectDocMode,
      isMoving,
      isDeleting,
      setRemoveDocList,
      setSelectDocMode,
      setMovingDoc,
      setDeletingDoc,
      setDocumentList,
      total,
      refetch,
      error,
      lastSelectedItemIdRef,
      shiftHoldingItemRef,
      handleSelectedItems,
      selectedFolders,
      isDragging,
      setDraggingDoc,
      setRemoveFolderList,
    ]
  );

  return (
    <DocumentContext.Provider value={documentContext}>
      <DocumentDragLayer />
      <DocumentList
        documents={documentList}
        hasNextPage={hasNextPage}
        fetchMore={fetchMore}
        refetchDocument={refetch}
        searchKey={searchKey}
        folder={folder}
        folders={folderList}
        total={total}
        folderLoading={folderLoading || Boolean(error) || !folder}
        documentLoading={documentLoading}
      />
    </DocumentContext.Provider>
  );
}

FolderDocumentList.propTypes = {
  searchKey: PropTypes.string,
  documentList: PropTypes.array,
  hasNextPage: PropTypes.bool,
  total: PropTypes.number,
  fetchMore: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  setDocumentList: PropTypes.func.isRequired,
  error: PropTypes.string,
  folder: PropTypes.object,
  folderList: PropTypes.array,
  folderLoading: PropTypes.bool,
  documentLoading: PropTypes.bool,
};

FolderDocumentList.defaultProps = {
  searchKey: '',
  documentList: [],
  hasNextPage: false,
  total: null,
  error: null,
  folder: null,
  folderLoading: true,
  documentLoading: true,
};

export default compose(withDragMoveDoc.Provider, React.memo)(FolderDocumentList);
