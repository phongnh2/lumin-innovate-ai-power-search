import { useSubscription } from '@apollo/client';
import produce from 'immer';
import { useEffect, useMemo, useRef } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { SUB_CREATE_FOLDER } from 'graphQL/FolderGraph';

import selectors from 'selectors';

import { useGetCurrentTeam, useGetFolderType } from 'hooks';

import { FolderUtils } from 'utils';

import { folderType as TabType } from 'constants/documentConstants';

export function useCreateFolderSubscription({ setFolderList, sortOption, folders, isSearchView }) {
  const { _id: userId } = useSelector(selectors.getCurrentUser, shallowEqual);
  const currentFolderType = useGetFolderType();
  const currentTeam = useGetCurrentTeam();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const foldersRef = useRef(folders);

  const { _id: teamId } = currentTeam || {};
  const { _id: orgId } = currentOrganization.data || {};
  const { folderId } = useParams();

  const subscriptionClientId = useMemo(() => {
    let clientId;
    switch (currentFolderType) {
      case TabType.INDIVIDUAL:
        clientId = userId;
        break;
      case TabType.TEAMS:
        clientId = teamId;
        break;
      case TabType.ORGANIZATION:
        clientId = orgId;
        break;
      default:
        break;
    }
    return clientId;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderType, teamId, orgId]);

  useEffect(() => {
    foldersRef.current = folders;
  }, [folders]);

  useSubscription(SUB_CREATE_FOLDER, {
    variables: {
      input: {
        clientId: subscriptionClientId,
        parentId: folderId,
        isStarredTab: currentFolderType === TabType.STARRED,
      },
    },
    skip: [TabType.SHARED, TabType.STARRED].includes(currentFolderType),
    onSubscriptionData: ({
      subscriptionData: {
        data: { createFolderSubscription },
      },
    }) => {
      if (!createFolderSubscription || isSearchView) {
        return;
      }
      const { folder } = createFolderSubscription;
      if (currentFolderType === TabType.INDIVIDUAL) {
        const { workspaceId } = folder.belongsTo;
        const isPersonalWorkspaceList = !workspaceId && !orgId;
        const isMyDocumentOrgList = workspaceId && orgId && workspaceId === orgId;
        if (!(isPersonalWorkspaceList || isMyDocumentOrgList)) {
          return;
        }
      }
      const newFolderList = produce(foldersRef.current, (draftFolders) => {
        draftFolders.unshift(folder);
      });
      setFolderList(FolderUtils.sortFolderList(newFolderList, sortOption));
    },
  });
}
