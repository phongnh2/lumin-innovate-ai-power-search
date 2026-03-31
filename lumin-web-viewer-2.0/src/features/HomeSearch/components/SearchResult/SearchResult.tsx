import { ScrollArea, Skeleton } from 'lumin-ui/kiwi-ui';
import React, { useContext, useMemo, useState } from 'react';

import { DEFAULT_SEARCH_VIEW_TYPE } from 'luminComponents/DefaultSearchView';
import { DefaultSearchView } from 'luminComponents/ReskinLayout/components/DefaultSearchView';
import { EmptySearchResult } from 'luminComponents/ReskinLayout/components/EmptySearchResult';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useTranslation } from 'hooks';

import { DocumentList } from 'features/DocumentList/components';
import { SearchResultContext } from 'features/HomeSearch/contexts';
import { useGetOrganizationResources } from 'features/HomeSearch/hooks/useGetOrganizationResources';
import { DocumentWithKind, FolderWithKind, ListItemKinds } from 'features/HomeSearch/types';

import { useGetOrganizationResourcesSubscription } from '../../hooks/useGetOrganizationResourcesSubscription';
import { DocumentItem } from '../DocumentItem';
import { DocumentListHeader } from '../DocumentListHeader';
import { DocumentSkeleton } from '../DocumentSkeleton';
import { FolderItem } from '../FolderItem';
import SearchResultProvider from '../SearchResultProvider';

import styles from './SearchResult.module.scss';

type SearchResultProps = {
  searchKey: string;
};

const SearchResult = (props: SearchResultProps) => {
  const { searchKey } = props;

  const { t } = useTranslation();

  const { refetch, getMore } = useGetOrganizationResources({ searchKey });

  const { state } = useContext(SearchResultContext);
  const { folders, documents, isLoading, total } = state;

  const foldersWithKind = (folders as FolderWithKind[]).map((folder) => ({
    ...folder,
    kind: ListItemKinds.FOLDER,
  }));

  const documentsWithKind = (documents as DocumentWithKind[]).map((doc) => ({
    ...doc,
    kind: ListItemKinds.DOCUMENT,
  }));

  const mergedData = [...foldersWithKind, ...documentsWithKind];

  const [listScrollRef, setListScrollRef] = useState<HTMLDivElement>(null);

  const { handleListSubscription } = useGetOrganizationResourcesSubscription();

  const shouldRenderEmptyState = useMemo(() => !isLoading && !mergedData.length, [mergedData.length, isLoading]);

  if (!searchKey) {
    return (
      <div className={styles.searchViewWrapper}>
        <DefaultSearchView type={DEFAULT_SEARCH_VIEW_TYPE.HOME} />
      </div>
    );
  }

  if (shouldRenderEmptyState) {
    return (
      <div className={styles.searchViewWrapper}>
        <EmptySearchResult type={DEFAULT_SEARCH_VIEW_TYPE.HOME} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {(isLoading || Boolean(mergedData.length)) && (
          <div className={styles.totalResults}>
            {isLoading ? (
              <Skeleton radius="sm" width={192} height={24} />
            ) : (
              <h2>
                {total} {t('searchDocument.result')}
              </h2>
            )}
          </div>
        )}
        <ScrollArea
          classNames={{
            root: styles.scrollAreaRoot,
          }}
          scrollbars="y"
          type="auto"
          viewportRef={(el) => setListScrollRef(el)}
        >
          <DocumentList
            isLoading={isLoading}
            refetchDocument={refetch}
            documents={mergedData}
            renderItem={(_, itemData, refetchDocument, openDocumentModal, openFolderModal) => {
              if (itemData.kind === ListItemKinds.FOLDER) {
                return <FolderItem folder={itemData as FolderWithKind} openFolderModal={openFolderModal} />;
              }

              return (
                <DocumentItem
                  document={itemData as DocumentWithKind}
                  refetchDocument={refetchDocument}
                  openDocumentModal={openDocumentModal}
                />
              );
            }}
            elements={{
              skeletonElement: <DocumentSkeleton />,
              headerElement: <DocumentListHeader />,
            }}
            isBackToTop
            fetchMore={getMore}
            parentScrollerRef={listScrollRef}
            dropFileDisabled
            classNames={{
              header: styles.header,
              backToTop: {
                container: styles.backToTop,
              },
            }}
            onSubscription={handleListSubscription}
          />
        </ScrollArea>
      </div>
    </div>
  );
};

const SearchResultWrapper = (props: SearchResultProps) => (
  <SearchResultProvider>
    <SearchResult {...props} />
  </SearchResultProvider>
);

export default withDropDocPopup.Provider(SearchResultWrapper);
