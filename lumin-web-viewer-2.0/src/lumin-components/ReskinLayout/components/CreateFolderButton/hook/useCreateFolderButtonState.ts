import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { matchPath, useLocation } from 'react-router';

import {
  useGetCurrentOrganization,
  useGetCurrentTeam,
  useGetCurrentUser,
  useGetFolderPermissions,
  usePersonalWorkspaceLocation,
} from 'hooks';
import { useEnableNestedFolder } from 'hooks/useEnableNestedFolder';
import { useFolderCount } from 'hooks/useFolderCount';
import { useNetworkStatus } from 'hooks/useNetworkStatus';

import { getTotalFolders } from 'services/graphServices/folder';

import { MAXIMUM_FOLDER } from 'constants/folderConstant';
import { LocationType } from 'constants/locationConstant';
import { ROUTE_MATCH } from 'constants/Routers';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { ITeam } from 'interfaces/team/team.interface';
import { IUser } from 'interfaces/user/user.interface';

import useFolderSubscriptions from './useFolderSubscriptions';

function getTotalFoldersPayload({
  currentOrganization,
  currentUser,
  isAtPersonalWorkspace,
  currentTeam,
  pathname,
}: {
  currentOrganization: IOrganization;
  currentUser: IUser;
  isAtPersonalWorkspace: boolean;
  currentTeam: ITeam;
  pathname: string;
}) {
  const { _id: userId } = currentUser || {};
  const isAtPersonalDocuments = !!matchPath({ path: ROUTE_MATCH.PERSONAL_DOCUMENTS, end: false }, pathname);

  if (isAtPersonalWorkspace) {
    return { refId: userId, targetType: LocationType.PERSONAL };
  }
  if (currentTeam?._id) {
    return { refId: currentTeam._id, targetType: LocationType.ORGANIZATION_TEAM };
  }
  if (isAtPersonalDocuments) {
    return { refId: currentOrganization._id, targetType: LocationType.PERSONAL };
  }
  return { refId: currentOrganization._id, targetType: LocationType.ORGANIZATION };
}

const useCreateFolderButtonState = () => {
  const { isOffline } = useNetworkStatus();
  const { isEnableNestedFolder } = useEnableNestedFolder();
  const {
    hasReachedDepthLimit,
    creatable,
    hasReachedLimit: oldHasReachedLimit,
    documentFolderType,
  } = useGetFolderPermissions();

  const currentOrganization = useGetCurrentOrganization();
  const isAtPersonalWorkspace = usePersonalWorkspaceLocation();
  const currentTeam = useGetCurrentTeam() as ITeam;
  const location = useLocation();
  const currentUser = useGetCurrentUser();

  const payload = useMemo(
    () =>
      getTotalFoldersPayload({
        currentOrganization,
        currentUser,
        isAtPersonalWorkspace,
        currentTeam,
        pathname: location.pathname,
      }),
    [currentOrganization, currentUser, isAtPersonalWorkspace, currentTeam, location.pathname]
  );

  const folderCountState = useFolderCount(payload);
  const { folderCount, updateFolderCount, queryKey } = folderCountState;

  const { isLoading } = useQuery({
    queryKey,
    queryFn: () => getTotalFolders(payload),
    enabled: !!payload.refId && !!payload.targetType,
    staleTime: Infinity,
    onSuccess: (data) => {
      updateFolderCount(data);
    },
  });

  const hasReachedLimit = isEnableNestedFolder ? folderCount >= MAXIMUM_FOLDER : oldHasReachedLimit;

  useFolderSubscriptions(folderCountState);

  return {
    isOffline,
    hasReachedDepthLimit,
    hasReachedLimit,
    isLoading,
    creatable,
    documentFolderType,
  };
};

export default useCreateFolderButtonState;
