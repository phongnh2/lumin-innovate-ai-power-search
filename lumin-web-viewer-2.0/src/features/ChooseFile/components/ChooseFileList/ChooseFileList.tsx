import { ScrollArea } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { useGetChooseFileList, useChooseFileContext, useHandleBreadcrumb } from 'features/ChooseFile/hooks';
import { ActionTypes } from 'features/ChooseFile/reducers/ChooseFile.reducer';
import { ListDataType } from 'features/ChooseFile/types';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { ITeam } from 'interfaces/team/team.interface';

import { DocumentItem, FolderItem, EmptyList, SkeletonItems, NoSearchResults } from './components';

import styles from './ChooseFileList.module.scss';

const TOTAL_SKELETON_ITEMS = 4;

type ListContextType = {
  isFetchingMore: boolean;
  selectedDocument: IDocumentBase;
};

type ChooseFileListProps = {
  getMoreInSearching?: (() => Promise<void>) | undefined;
};

const ListFooter = ({ context }: { context: ListContextType }) => (context?.isFetchingMore ? <SkeletonItems /> : null);

const ChooseFileList = ({ getMoreInSearching }: ChooseFileListProps) => {
  const { getMore } = useGetChooseFileList();

  const { state: chooseFileState, dispatch } = useChooseFileContext();
  const { formatLocationData } = useHandleBreadcrumb();
  const { isLoading, data } = chooseFileState.locationData;

  const listRef = useRef<HTMLDivElement>(null);

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const shouldRenderEmptyState = useMemo(
    () => !chooseFileState.searchKey && !isLoading && !data.length,
    [data.length, isLoading, chooseFileState.searchKey]
  );

  const shouldRenderNoResultsState = useMemo(
    () => chooseFileState.searchKey && !isLoading && !data.length,
    [data.length, isLoading, chooseFileState.searchKey]
  );

  const onFetchMore = useCallback(async () => {
    try {
      setIsFetchingMore(true);
      if (getMoreInSearching) {
        await getMoreInSearching();
      } else {
        await getMore();
      }
    } finally {
      setIsFetchingMore(false);
    }
  }, [getMore, getMoreInSearching]);

  const listContext = useMemo(
    () => ({ isFetchingMore, selectedDocument: chooseFileState.selectedDocument } as ListContextType),
    [chooseFileState.selectedDocument, isFetchingMore]
  );

  const onSelectFolder = useCallback(
    (folder: IFolder) => {
      const breadcrumbData = [];
      const belongsToData = folder.belongsTo;
      const locationData = formatLocationData({
        location: belongsToData.location as IOrganization | ITeam,
        type: belongsToData.type,
      });
      breadcrumbData.push({
        _id: locationData?._id,
        name: locationData?.name,
        folderType: locationData?.folderType,
      });
      const { breadcrumbs } = folder;
      breadcrumbs.forEach((breadcrumb) => {
        breadcrumbData.push({
          _id: breadcrumb._id,
          name: breadcrumb.name,
        });
      });
      breadcrumbData.push({
        _id: folder._id,
        name: folder.name,
      });
      dispatch({
        type: ActionTypes.SET_BREADCRUMB_DATA,
        payload: {
          breadcrumbData,
        },
      });
      if (chooseFileState.searchKey) {
        dispatch({
          type: ActionTypes.SET_SEARCH_KEY,
          payload: {
            value: '',
          },
        });
      }
    },
    [dispatch, chooseFileState.searchKey]
  );

  const onSelectDocument = useCallback(
    (document: IDocumentBase) => {
      dispatch({
        type: ActionTypes.SET_SELECTED_DOCUMENT,
        payload: {
          document,
        },
      });
    },
    [dispatch]
  );

  const renderItem = (_: number, item: ListDataType, context: ListContextType) => {
    if (item.kind === 'folder') {
      return <FolderItem folder={item} onSelect={() => onSelectFolder(item)} />;
    }

    const isSelectedDocument = item._id === context.selectedDocument?._id;
    return <DocumentItem document={item} isSelected={isSelectedDocument} onSelect={() => onSelectDocument(item)} />;
  };

  const renderList = () => (
    <ScrollArea
      viewportRef={listRef}
      classNames={{
        root: styles.scrollAreaRoot,
        viewport: styles.scrollAreaViewport,
      }}
    >
      {isLoading ? (
        <SkeletonItems itemLength={TOTAL_SKELETON_ITEMS} />
      ) : (
        <Virtuoso
          context={listContext}
          data={data}
          customScrollParent={listRef.current ?? undefined}
          itemContent={renderItem}
          endReached={onFetchMore}
          components={{
            Footer: ListFooter,
          }}
        />
      )}
    </ScrollArea>
  );

  if (shouldRenderEmptyState) {
    return <EmptyList />;
  }

  if (shouldRenderNoResultsState) {
    return <NoSearchResults />;
  }

  return <div className={styles.container}>{renderList()}</div>;
};

export default ChooseFileList;
