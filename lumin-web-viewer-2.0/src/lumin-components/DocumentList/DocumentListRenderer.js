/* eslint-disable react/prop-types */
import { produce } from 'immer';
import PropTypes from 'prop-types';
import React, { useContext, useState, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso';
import { compose } from 'redux';

import selectors from 'selectors';

import { AppLayoutContext } from 'layouts/AppLayout/AppLayoutContext';

import { DocumentContext } from 'lumin-components/Document/context';
import { useValidateDocumentRemoval } from 'lumin-components/Document/hooks';
import DocumentItemContainer from 'lumin-components/DocumentItemContainer';
import DocumentSkeleton from 'lumin-components/DocumentSkeleton';
import DocumentGridItemSkeleton from 'lumin-components/DocumentSkeleton/DocumentGridItemSkeleton';
import FailedFetchError from 'lumin-components/FailedFetchError';
import { EmptyDocumentList } from 'luminComponents/ReskinLayout/components/EmptyDocumentList';
import { FolderItemContainer } from 'luminComponents/ReskinLayout/components/FolderItemContainer';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';

import { useGetCurrentUser } from 'hooks';
import { useDesktopMatch } from 'hooks/useDesktopMatch';
import useGetFolderType from 'hooks/useGetFolderType';
import useGetIsCompletedUploadDocuments from 'hooks/useGetIsCompletedUploadDocuments';
import useHideTooltipOnScroll from 'hooks/useHideTooltipOnScroll';
import { useLargeDesktopMatch } from 'hooks/useLargeDesktopMatch';
import { useOfflineAction } from 'hooks/useOfflineAction';
import { useTabletMatch } from 'hooks/useTabletMatch';

import { documentGraphServices } from 'services/graphServices';

import { matchPaths } from 'helpers/matchPaths';

import toastUtils from 'utils/toastUtils';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { layoutType } from 'constants/documentConstants';
import { ModalTypes, STORAGE_TYPE, CHECKBOX_TYPE } from 'constants/lumin-common';
import { ROUTE_MATCH } from 'constants/Routers';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { withResetSelectedState } from './HOC';
import useCachingFileHandler from './hooks/useCachingFileHandler';
import useCloseContextMenuOnScroll from './hooks/useCloseContextMenuOnScroll';
import useFindDocumentLocation from './hooks/useFindDocumentLocation';
import useScrollToNewUploadedDocument from './hooks/useScrollToNewUploadedDocument';
import { socket } from '../../socket';

import * as Styled from './DocumentList.styled';

import styles from './DocumentList.module.scss';

const propTypes = {
  documents: PropTypes.array,
  folderLoading: PropTypes.bool,
  documentLoading: PropTypes.bool,
  hasNextPage: PropTypes.bool.isRequired,
  fetchMore: PropTypes.func.isRequired,
  openDocumentModal: PropTypes.func.isRequired,
  total: PropTypes.number,
};
const defaultProps = {
  documents: [],
  folderLoading: true,
  documentLoading: true,
  total: null,
};

const VirtuosoGridContainer = React.forwardRef(({ style, children }, ref) => (
  <div ref={ref} style={style} className={styles.virtuosoGrid}>
    {children}
  </div>
));

function DocumentListRenderer({
  folderLoading,
  documentLoading,
  folders,
  documents,
  hasNextPage,
  fetchMore,
  openDocumentModal,
  total,
}) {
  const location = useLocation();

  const virtuosoRef = useRef();
  const isTabletUpMatch = useTabletMatch();
  const isDesktopUpMatch = useDesktopMatch();
  const isLargeDesktopUpMatch = useLargeDesktopMatch();
  const currentFolderType = useGetFolderType();
  const currentUser = useGetCurrentUser();
  const [isFetching, setFetching] = useState(false);
  const {
    documentLayout,
    error: documentError,
    refetchDocument,
    handleSelectedItems,
    lastSelectedDocIdRef,
    setDocumentList,
  } = useContext(DocumentContext);
  const { bodyScrollRef } = useContext(AppLayoutContext);

  const isRemovable = useValidateDocumentRemoval();
  const { isVisible: isChatbotOpened } = useChatbotStore();
  const { makeOffline, pendingDownloadedDocument, setPendingDownloadedDocument, onDownloadDocument } =
    useOfflineAction();

  useHideTooltipOnScroll({ container: bodyScrollRef.current });
  useCloseContextMenuOnScroll();
  useCachingFileHandler({ setPendingDownloadedDocument, pendingDownloadedDocument, onDownloadDocument });

  const isFolderDocumentRoute = Boolean(
    matchPaths(
      [
        ROUTE_MATCH.FOLDER_DOCUMENT,
        ROUTE_MATCH.ORGANIZATION_FOLDER_DOCUMENT.TEAM,
        ROUTE_MATCH.PREMIUM_USER_PATHS.FOLDER_DOCUMENTS,
      ].map((path) => ({ path, end: false })),
      location.pathname
    )
  );
  const isSharedDocumentRoute = Boolean(
    matchPaths(
      [ROUTE_MATCH.SHARED_DOCUMENTS, ROUTE_MATCH.PREMIUM_USER_PATHS.SHARED_DOCUMENTS].map((path) => ({
        path,
        end: false,
      })),
      location.pathname
    )
  );

  const isListLayout = documentLayout === layoutType.list;

  const shouldRenderFolderItems = !isSharedDocumentRoute;

  const shouldRenderEmptyState = useMemo(() => {
    const condition = !documentLoading && typeof total === 'number' && !total && !documents.length;

    if (shouldRenderFolderItems) {
      return condition && !folderLoading && !folders.length;
    }

    return condition;
  }, [shouldRenderFolderItems, documentLoading, folderLoading, total, documents.length, folders.length]);

  const isCompletedUploadDocuments = useGetIsCompletedUploadDocuments();

  const newestUploadedDocument = useMemo(
    () => (documents && documents.length > 0 && documents[0].newUpload ? documents[0] : null),
    [documents]
  );

  const { findDocumentLoading } = useFindDocumentLocation({
    documents,
    folders,
    fetchMore,
    isHasMore: hasNextPage && !isFetching,
    currentFolderType,
    isDocumentInFolder: isFolderDocumentRoute,
    setDocumentListInFolder: setDocumentList,
    virtuosoRef,
  });
  useScrollToNewUploadedDocument({
    scrollToElement:
      newestUploadedDocument &&
      ((newestUploadedDocument.service === STORAGE_TYPE.S3 && isCompletedUploadDocuments) ||
        newestUploadedDocument.service !== STORAGE_TYPE.S3),
    virtuosoRef,
    documents,
    folders,
  });

  const mergedDocsAndFolders = useMemo(
    () =>
      produce(documents ?? [], (draft) => {
        if (shouldRenderFolderItems) {
          draft.unshift(...(folders ?? []));
        }
      }),
    [documents, folders, shouldRenderFolderItems]
  );

  const getColumnCount = () => {
    if (isLargeDesktopUpMatch) {
      return 5;
    }
    if (isDesktopUpMatch) {
      return 4;
    }
    if (isTabletUpMatch) {
      return 3;
    }
    return 2;
  };

  const handleStarClick = useCallback(
    (document) => async () => {
      const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;
      if (isSystemFile) {
        systemFileHandler.starFile({ documentId: document._id, isStarred: !document.isStarred });
        return;
      }
      try {
        await documentGraphServices.starDocumentMutation({
          document,
          currentUser,
          clientId: currentUser._id,
        });
        socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, { roomId: document._id, type: 'star' });
        const isStarred = document.listUserStar && document.listUserStar.includes(currentUser._id);
        if (isStarred) {
          handleSelectedItems({
            currentItem: document,
            lastSelectedDocId: lastSelectedDocIdRef.current,
            checkboxType: CHECKBOX_TYPE.DESELECT,
          });
        }
      } catch (e) {
        toastUtils.openToastMulti({
          type: ModalTypes.ERROR,
          message: "Can't mark this document as favorite",
        });
      }
    },
    [currentUser]
  );

  const foundDocumentScrolling = useSelector((state) => selectors.getFoundDocumentScrolling(state, currentFolderType));

  const itemRenderer = useCallback(
    (index, item) => {
      const isFolderItem = shouldRenderFolderItems && index < folders.length;
      return (
        <Styled.Wrapper key={item._id} data-cy="list_item_wrapper">
          {isFolderItem ? (
            <FolderItemContainer folder={item} type={documentLayout} />
          ) : (
            <DocumentItemContainer
              openSettingDocumentModal={openDocumentModal}
              handleStarClick={handleStarClick}
              document={item}
              type={documentLayout}
              isRemovable={isRemovable}
              makeOffline={makeOffline}
              foundDocumentScrolling={foundDocumentScrolling}
            />
          )}
        </Styled.Wrapper>
      );
    },
    [shouldRenderFolderItems, isRemovable, makeOffline, documentLayout, foundDocumentScrolling, folders.length]
  );

  const onFetchMore = useCallback(async () => {
    if (!hasNextPage || isFetching) {
      return;
    }
    try {
      setFetching(true);
      await fetchMore();
    } finally {
      setFetching(false);
    }
  }, [hasNextPage, isFetching]);

  const renderVirtuosoFooter = useCallback(
    ({ context }) => {
      if (!context.isFetchingMore) {
        return null;
      }
      if (isListLayout) {
        return (
          <Styled.SkeletonContainer>
            <DocumentSkeleton count={1} layout={layoutType.list} />
          </Styled.SkeletonContainer>
        );
      }
      const columnCount = isChatbotOpened ? getColumnCount() - 1 : getColumnCount();
      const skeletonItems = columnCount - (mergedDocsAndFolders.length % columnCount) || columnCount;
      return Array(skeletonItems)
        .fill()
        .map((_, index) => <DocumentGridItemSkeleton key={index} />);
    },
    [isChatbotOpened, isListLayout, mergedDocsAndFolders.length]
  );

  const renderList = () => {
    const columnCount = isChatbotOpened ? getColumnCount() - 1 : getColumnCount();
    if (
      (shouldRenderFolderItems && folderLoading && !folders.length) ||
      (documentLoading && !documents.length) ||
      findDocumentLoading
    ) {
      return (
        <Styled.SkeletonContainer>
          {isListLayout ? (
            <DocumentSkeleton layout={documentLayout} />
          ) : (
            <DocumentSkeleton count={columnCount} columnCount={columnCount} layout={documentLayout} />
          )}
        </Styled.SkeletonContainer>
      );
    }
    return (
      <div className={styles.virtuosoContainer}>
        {isListLayout ? (
          <Virtuoso
            ref={virtuosoRef}
            context={{
              isFetchingMore: isFetching,
            }}
            data={mergedDocsAndFolders}
            fixedItemHeight={49}
            customScrollParent={bodyScrollRef.current}
            itemContent={itemRenderer}
            endReached={onFetchMore}
            computeItemKey={(_, item) => item._id}
            components={{
              Footer: renderVirtuosoFooter,
            }}
          />
        ) : (
          <VirtuosoGrid
            ref={virtuosoRef}
            context={{
              isFetchingMore: isFetching,
            }}
            fixedItemHeight={193}
            data={mergedDocsAndFolders}
            customScrollParent={bodyScrollRef.current}
            itemContent={itemRenderer}
            endReached={onFetchMore}
            computeItemKey={(_, item) => item._id}
            components={{
              List: VirtuosoGridContainer,
              Footer: renderVirtuosoFooter,
            }}
          />
        )}
      </div>
    );
  };

  if (documentError) {
    return (
      <div className={styles.failedFetchErrorWrapper}>
        <FailedFetchError retry={refetchDocument} />
      </div>
    );
  }
  return shouldRenderEmptyState ? <EmptyDocumentList pageType={currentFolderType} /> : renderList();
}

DocumentListRenderer.propTypes = propTypes;
DocumentListRenderer.defaultProps = defaultProps;

export default compose(withResetSelectedState, React.memo)(DocumentListRenderer);
