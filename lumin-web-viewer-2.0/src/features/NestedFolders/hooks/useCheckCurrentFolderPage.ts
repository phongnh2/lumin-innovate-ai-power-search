import { useParams } from 'react-router';

import { IFolder } from 'interfaces/folder/folder.interface';

const useCheckCurrentFolderPage = (folder: IFolder): boolean => {
  const { folderId } = useParams();
  if (!folder || !folderId) {
    return false;
  }
  return folderId === folder._id;
};

export default useCheckCurrentFolderPage;
