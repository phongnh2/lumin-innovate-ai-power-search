import { useCallback, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

import { cache } from 'src/apollo';

import { useGetFolderType } from 'hooks';

import { folderType } from 'constants/documentConstants';
import { ORG_PATH } from 'constants/organizationConstants';

const getDocumentQuery = (inOrganization) => (inOrganization ? 'getOrganizationDocuments' : 'getDocuments');

const getQuery = ({ currentFolderType, inOrganization }) => ({
  [folderType.ORGANIZATION]: 'getOrganizationDocuments',
  [folderType.TEAMS]: 'getOrganizationTeamDocuments',
}[currentFolderType] || getDocumentQuery(inOrganization));

const useResetCacheAfterSearching = () => {
  const location = useLocation();
  const currentFolderType = useGetFolderType();
  const inOrganization = Boolean(matchPath({ path: ORG_PATH, end: false }, location.pathname));
  const resetCacheByQuery = useCallback(() => {
    cache.evict({
      fieldName: getQuery({ currentFolderType, inOrganization }),
      broadcast: false,
    });
    cache.gc();
  }, [currentFolderType, inOrganization]);

  return useMemo(() => ({
    resetCacheByQuery,
  }), [resetCacheByQuery]);
};

export default useResetCacheAfterSearching;
