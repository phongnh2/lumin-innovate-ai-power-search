import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';
import { compose } from 'redux';

import { DndProvider } from '@libs/react-dnd';
import { DefaultSearchView as DefaultSearchViewReskin } from '@web-new-ui/components/DefaultSearchView';
import { EmptySearchResult } from '@web-new-ui/components/EmptySearchResult';

import selectors from 'selectors';

import { DEFAULT_SEARCH_VIEW_TYPE } from 'lumin-components/DefaultSearchView';
import DocumentComponents from 'lumin-components/DocumentComponents';
import DocumentDragLayer from 'lumin-components/Shared/DocumentDragLayer';
import DocumentListContainer from 'luminComponents/DocumentListContainer';

import withDragMoveDoc from 'HOC/withDragMoveDoc';

import { useSetupCoreWorker, useDropboxMessageEvent, useGetFolderType } from 'hooks';
import { useSelectItems } from 'hooks/useSelectItems';

import { documentServices } from 'services';

import { matchPaths } from 'helpers/matchPaths';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { layoutType, folderType } from 'constants/documentConstants';
import { DocFolderMapping, FOLDER_SORT_DIRECTION, FOLDER_SORT_OPTIONS, FolderType } from 'constants/folderConstant';
import { CHECKBOX_TYPE } from 'constants/lumin-common';
import { ROUTE_MATCH } from 'constants/Routers';

import DocumentTitle from './components/DocumentTitle';
import OrganizationPageTitle from './components/OrganizationPageTitle';
import PersonalPageTitle from './components/PersonalPageTitle';
import { DocumentContext, DocumentSearchContext } from './context';
import withEnhancedDocuments from './HOC/withEnhancedDocuments';
import {
  useCloudDocSync,
  useCreateFolderSubscription,
  useGetAllFolder,
  useHandleGoogleOpenStateError,
  useUpdateFolderListSubscription,
} from './hooks';
import { useDocumentSelectionStore } from './hooks/useDocumentSelectionStore';

import styles from './Document.module.scss';

const AnnouncementModal = lazyWithRetry(() => import('lumin-components/AnnouncementModal'));

function Document({ searchKey, isFocusing, setSearchKey, setFocusing, queryProps, folderListData, isInOrgPage }) {
  const location = useLocation();

  const { total: totalDocuments, loading: documentLoading, documentList, error, refetch: refetchDocument } = queryProps;
  const { data: folderList, loading: folderLoading } = folderListData;
  const totalFoundResults = folderList.length + totalDocuments;

  const [documentLayout, setDocumentLayout] = useState(layoutType.list);
  const [isMoving, setMovingDoc] = useState(false);
  const [isDeleting, setDeletingDoc] = useState(false);
  const [isDragging, setDraggingDoc] = useState(false);
  const [openAnnouncementModal, setOpenAnnouncementModal] = useState(location.state?.showModal);
  const [selectedDocList, setSelectedDocList] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [openDefaultSearchView, setOpenDefaultSearchView] = useState(false);
  const currentFolderType = useGetFolderType();
  const { setSelectedDocuments } = useDocumentSelectionStore();

  const defaultFolderType = isInOrgPage ? FolderType.ORGANIZATION : FolderType.PERSONAL;
  const documentFolderType =
    currentFolderType === folderType.STARRED ? defaultFolderType : DocFolderMapping[currentFolderType];

  const isSharedDocumentRoute = Boolean(
    matchPaths(
      [ROUTE_MATCH.SHARED_DOCUMENTS, ROUTE_MATCH.PREMIUM_USER_PATHS.SHARED_DOCUMENTS].map((path) => ({
        path,
        end: false,
      })),
      location.pathname
    )
  );

  const { update, sortOption, value } = useGetAllFolder({
    type: documentFolderType,
    sortKey: FOLDER_SORT_OPTIONS.DATE_CREATED.key,
    sortDirection: FOLDER_SORT_DIRECTION.DESC,
    parentId: '',
    searchKey,
  });
  const folderSubscriptionProps = {
    setFolderList: update,
    sortOption,
    folders: value,
    isSearchView: isFocusing || Boolean(searchKey),
  };

  useSetupCoreWorker();
  useDropboxMessageEvent();
  useHandleGoogleOpenStateError();
  useCloudDocSync({ loading: queryProps.loading, documents: documentList });
  useCreateFolderSubscription(folderSubscriptionProps);
  useUpdateFolderListSubscription(folderSubscriptionProps);

  useEffect(() => {
    if (searchKey && documentLayout === layoutType.grid) {
      setDocumentLayout(layoutType.list);
    }
    setOpenDefaultSearchView(isFocusing && !searchKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey, isFocusing]);

  useEffect(() => {
    setSelectedDocuments(selectedDocList);
  }, [selectedDocList, setSelectedDocuments]);

  const handleCloseAnnouncementModal = () => setOpenAnnouncementModal(false);

  const setRemoveDocList = useCallback(({ data = {}, type = CHECKBOX_TYPE.SELECT }) => {
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

  const documentContext = useMemo(
    () => ({
      documentLayout,
      setDocumentLayout,
      selectedDocList,
      isMoving,
      isDeleting,
      setRemoveDocList,
      setIsMoving: setMovingDoc,
      setIsDeleting: setDeletingDoc,
      lastSelectedDocIdRef: lastSelectedItemIdRef,
      shiftHoldingRef: shiftHoldingItemRef,
      isDragging,
      setDraggingDoc,
      error,
      refetchDocument,
      selectedFolders,
      handleSelectedItems,
      setRemoveFolderList,
    }),
    [
      documentLayout,
      selectedDocList,
      isMoving,
      isDeleting,
      setRemoveDocList,
      isDragging,
      setDraggingDoc,
      error,
      refetchDocument,
      selectedFolders,
      handleSelectedItems,
      setRemoveFolderList,
      lastSelectedItemIdRef,
      shiftHoldingItemRef,
    ]
  );

  const searchContext = useMemo(
    () => ({
      searchKey,
      isFocusing,
      setFocusing,
      isSearchView: isFocusing || Boolean(searchKey),
      documentLoading,
      folderLoading,
      isEmptyList: !documentList.length && !folderList.length,
      totalFoundResults,
    }),
    [
      documentList.length,
      folderList.length,
      documentLoading,
      folderLoading,
      isFocusing,
      searchKey,
      setFocusing,
      totalFoundResults,
    ]
  );

  const shouldShowResult = searchKey && !documentLoading && (isSharedDocumentRoute || !folderLoading);

  const renderMainBody = () => {
    const isEmptySearchResult = shouldShowResult && !totalFoundResults && !openDefaultSearchView;

    const defaultSearchViewType =
      currentFolderType === folderType.DEVICE ? DEFAULT_SEARCH_VIEW_TYPE.DEVICE : DEFAULT_SEARCH_VIEW_TYPE.DOCUMENT;

    if (isEmptySearchResult) {
      return <EmptySearchResult />;
    }

    return (
      <>
        {openDefaultSearchView && <DefaultSearchViewReskin type={defaultSearchViewType} />}
        <div className={styles.container} data-display={!openDefaultSearchView}>
          <DocumentListContainer
            {...queryProps}
            documentLoading={documentLoading}
            folderLoading={folderLoading}
            folders={folderList}
          />
        </div>
      </>
    );
  };

  const renderPageTitle = () => (isInOrgPage ? <OrganizationPageTitle /> : <PersonalPageTitle />);

  return (
    <>
      {renderPageTitle()}
      <DndProvider>
        <DocumentContext.Provider value={documentContext}>
          <DocumentDragLayer />
          <DocumentSearchContext.Provider value={searchContext}>
            <div className={styles.contentWrapper}>
              <DocumentComponents.HeaderTitle setSearchKey={setSearchKey} leftTitle={<DocumentTitle />} canUpload />
              {renderMainBody()}
            </div>
          </DocumentSearchContext.Provider>
          {openAnnouncementModal && <AnnouncementModal onClose={handleCloseAnnouncementModal} />}
        </DocumentContext.Provider>
      </DndProvider>
    </>
  );
}

Document.propTypes = {
  setSearchKey: PropTypes.func.isRequired,
  searchKey: PropTypes.string,
  queryProps: PropTypes.object.isRequired,
  folderListData: PropTypes.object.isRequired,
  isInOrgPage: PropTypes.bool,
  isFocusing: PropTypes.bool,
  setFocusing: PropTypes.func,
};

Document.defaultProps = {
  searchKey: '',
  isInOrgPage: false,
  isFocusing: false,
  setFocusing: () => {},
};

const mapStateToProps = (state) => ({
  folderListData: selectors.getFolderList(state),
});

export default compose(withDragMoveDoc.Provider, withEnhancedDocuments, connect(mapStateToProps), React.memo)(Document);
