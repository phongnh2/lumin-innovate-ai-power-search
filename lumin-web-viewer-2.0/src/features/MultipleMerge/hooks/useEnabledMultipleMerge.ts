import useGetFolderType from 'hooks/useGetFolderType';

import { folderType } from 'constants/documentConstants';

export const useEnabledMultipleMerge = () => {
  const currentFolderType = useGetFolderType();

  return {
    enabled: [folderType.ORGANIZATION, folderType.TEAMS, folderType.INDIVIDUAL].includes(currentFolderType),
  };
};
