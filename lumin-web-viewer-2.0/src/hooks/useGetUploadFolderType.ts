import { DOCUMENT_TYPE, folderType } from 'constants/documentConstants';

import useGetFolderType from './useGetFolderType';
import { useViewerMatch } from './useViewerMatch';

const useGetUploadFolderType = () => {
  const currentFolderType = useGetFolderType();
  const { isViewer } = useViewerMatch();

  if (!isViewer) {
    return currentFolderType;
  }

  switch (currentFolderType.toUpperCase()) {
    case DOCUMENT_TYPE.PERSONAL:
      return folderType.INDIVIDUAL;
    case DOCUMENT_TYPE.ORGANIZATION_TEAM:
      return folderType.TEAMS;
    default:
      return currentFolderType;
  }
};

export default useGetUploadFolderType;
