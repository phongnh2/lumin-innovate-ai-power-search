import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import useDeleteFolder from 'hooks/useDeleteFolder';
import useGetFolderUrl from 'hooks/useGetFolderUrl';

import { FolderServices } from 'services';

import { FolderAction, FolderLocationTypeMapping } from 'constants/folderConstant';

import { IFolder } from 'interfaces/folder/folder.interface';

import { ExtendedFolderModalProps } from '../HOC/withFolderModal';
import { FolderActionsType } from '../types';

type UseFolderActionsProps = {
  folder: IFolder;
  openFolderModal: ExtendedFolderModalProps['openFolderModal'];
};

type UseFolderActionsOutput = {
  actions: FolderActionsType;
};

const useFolderActions = ({ folder, openFolderModal }: UseFolderActionsProps): UseFolderActionsOutput => {
  const navigate = useNavigate();

  const folderType = useMemo(() => FolderLocationTypeMapping[folder.belongsTo.type], [folder.belongsTo.type]);

  // [START] click folder
  const folderUrl = useGetFolderUrl({ folder });
  const handleOpenFolder = useCallback(() => {
    if (!folderUrl) {
      return;
    }

    navigate(folderUrl);
  }, [folderUrl, navigate]);
  // [END]

  // [START] click star
  const handleClickStar = useCallback(async () => {
    const folderServices = new FolderServices(folderType);
    await folderServices.starFolder(folder._id);
  }, [folder._id, folderType]);
  // [END]

  // [START] remove
  const { openDeleteModal } = useDeleteFolder(folderType, folder, () => {});
  // [END]

  const folderActions = useMemo(
    () =>
      ({
        open: () => handleOpenFolder(),
        viewInfo: () => openFolderModal({ mode: FolderAction.INFO, folder }),
        rename: () => openFolderModal({ mode: FolderAction.EDIT, folder }),
        markFavorite: () => handleClickStar(),
        remove: () => openDeleteModal(),
      } as FolderActionsType),
    [folder, handleClickStar, handleOpenFolder, openDeleteModal, openFolderModal]
  );

  return {
    actions: folderActions,
  };
};

export default useFolderActions;
