/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useMatch, useParams } from 'react-router-dom';

import selectors from 'selectors';

import { FolderPermissions } from 'utils/Factory/FolderPermissions';

import { folderType } from 'constants/documentConstants';
import {
  DocFolderMapping,
  FolderPermission,
  FolderType,
  MAXIMUM_FOLDER,
  MAXIMUM_FOLDER_DEPTH,
} from 'constants/folderConstant';
import { ORG_PATH } from 'constants/organizationConstants';

import { useEnableNestedFolder } from './useEnableNestedFolder';
import useGetCurrentFolder from './useGetCurrentFolder';
import useGetCurrentTeam from './useGetCurrentTeam';
import useGetFolderType from './useGetFolderType';

type UseCheckFolderPermissionsData = {
  documentFolderType: string;
  hasReachedLimit: boolean;
  hasReachedDepthLimit: boolean;
  creatable: boolean;
  editable: boolean;
  deletable: boolean;
};

const useGetFolderPermissions = (): UseCheckFolderPermissionsData => {
  const currentTeam = useGetCurrentTeam();
  const currentFolderType = useGetFolderType();
  const currentFolder = useGetCurrentFolder();
  const { folderId } = useParams();
  const { isEnableNestedFolder } = useEnableNestedFolder();

  const { data: folderList } = useSelector(selectors.getFolderList, shallowEqual);

  const isInOrgPage = Boolean(useMatch({ path: ORG_PATH, end: false }));

  const defaultFolderType = isInOrgPage ? FolderType.ORGANIZATION : FolderType.PERSONAL;
  const documentFolderType =
    currentFolderType === folderType.STARRED ? defaultFolderType : DocFolderMapping[currentFolderType];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const hasReachedLimit = useMemo(() => folderList?.length >= MAXIMUM_FOLDER, [folderList?.length]);
  const hasReachedDepthLimit = useMemo(
    () => typeof currentFolder?.depth === 'number' && currentFolder.depth >= MAXIMUM_FOLDER_DEPTH,
    [currentFolder?.depth]
  );

  const folderPermissions = useMemo(
    () =>
      new FolderPermissions({
        type: documentFolderType,
        team: currentTeam,
        folder: currentFolder,
      }),
    [documentFolderType, currentTeam, currentFolder]
  );

  const creatable = useMemo(() => {
    const isStarTab = currentFolderType === folderType.STARRED;
    const isSharedTab = currentFolderType === folderType.SHARED;
    const isNestedFolder = Boolean(folderId);

    return (
      folderPermissions.hasPermission(FolderPermission.CREATE) &&
      !isStarTab &&
      !isSharedTab &&
      (!isNestedFolder || isEnableNestedFolder)
    );
  }, [currentFolderType, folderPermissions, isEnableNestedFolder, folderId]);

  const editable = useMemo(() => folderPermissions.hasPermission(FolderPermission.EDIT), [folderPermissions]);
  const deletable = useMemo(() => folderPermissions.hasPermission(FolderPermission.DELETE), [folderPermissions]);

  return {
    creatable,
    hasReachedLimit,
    hasReachedDepthLimit,
    documentFolderType,
    editable,
    deletable,
  };
};

export default useGetFolderPermissions;
