import { useSubscription } from '@apollo/client';
import produce from 'immer';
import { shallowEqual, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { SUB_UPDATE_FOLDER } from 'graphQL/FolderGraph';

import selectors from 'selectors';

import { useGetFolderType } from 'hooks';

import { FolderUtils } from 'utils';

import { folderType as TabType } from 'constants/documentConstants';
import SubscriptionConstants from 'constants/subscriptionConstant';

const { Subscription } = SubscriptionConstants;

export function useUpdateFolderListSubscription({ folders: folderList, setFolderList, sortOption, isSearchView }) {
  const { _id: userId } = useSelector(selectors.getCurrentUser, shallowEqual);
  const currentFolderType = useGetFolderType();
  const { folderId } = useParams();

  const updateFolderHOF = (handler) => (folder) => {
    const isExisted = folderList.some(({ _id }) => folder._id === _id);
    if (!isExisted) {
      return;
    }
    handler(folder);
  };

  const updateFolderInfo = (folder) => {
    const newFolderList = produce(folderList, (draftFolders) => {
      const updatedFolder = draftFolders.find(({ _id }) => folder._id === _id);
      Object.assign(updatedFolder, folder);
    });
    setFolderList(FolderUtils.sortFolderList(newFolderList, sortOption));
  };

  const removeFolders = (folders) => {
    const folderIds = folders.map(({ _id }) => _id);
    setFolderList(folderList.filter((folder) => !folderIds.includes(folder._id)));
  };

  const pushFolderToList = (folder) => {
    const newFolderList = produce(folderList, (draftFolders) => {
      draftFolders.unshift(folder);
    });
    setFolderList(FolderUtils.sortFolderList(newFolderList, sortOption));
  };

  const handleUpdateStarredFolder = (folder) => {
    if (currentFolderType !== TabType.STARRED) {
      updateFolderInfo(folder);
      return;
    }

    if (!folder.listUserStar.includes(userId)) {
      removeFolders([folder]);
      return;
    }
    if (!isSearchView) {
      pushFolderToList(folder);
    }
  };

  const folderSubscriptionHandler = {
    [Subscription.DELETE_FOLDER]: removeFolders,
    [Subscription.UPDATE_FOLDER_INFO]: updateFolderHOF(updateFolderInfo),
    [Subscription.UPDATE_STARRED_FOLDER]: handleUpdateStarredFolder,
  };

  useSubscription(SUB_UPDATE_FOLDER, {
    variables: {
      input: {
        userId,
        parentId: folderId,
      },
    },
    onSubscriptionData: ({
      subscriptionData: {
        data: { updateFolderSubscription },
      },
    }) => {
      if (!updateFolderSubscription) {
        return;
      }
      const { folder, folders, subscriptionEvent } = updateFolderSubscription;
      const updateHandler = folderSubscriptionHandler[subscriptionEvent];
      if (subscriptionEvent === Subscription.DELETE_FOLDER) {
        updateHandler(folders?.length ? folders : [folder]);
      } else {
        updateHandler(folder);
      }
    },
  });
}
