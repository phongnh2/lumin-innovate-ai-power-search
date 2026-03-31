import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useMatch } from 'react-router';

import selectors from 'selectors';

import { useGetCurrentTeam, useGetFolderType } from 'hooks';

import { folderType } from 'constants/documentConstants';
import { ORG_PATH } from 'constants/organizationConstants';

function useGetAllFolderParams() {
  const isOrgPage = Boolean(useMatch({ path: ORG_PATH, end: false }));
  const currentTeam = useGetCurrentTeam();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const currentFolderType = useGetFolderType();
  const { _id: teamId } = currentTeam || {};
  const { _id: orgId } = currentOrganization.data || {};
  return useMemo(() => {
    let params = {};
    const attachOrgId = () => {
      if (isOrgPage) {
        params.orgId = orgId;
      }
    };
    switch (currentFolderType) {
      case folderType.ORGANIZATION:
        params = {
          orgId,
        };
        break;
      case folderType.TEAMS:
        params = {
          teamId,
        };
        break;
      case folderType.STARRED:
        params = {
          isStarredTab: true,
        };
        attachOrgId();
        break;
      case folderType.INDIVIDUAL:
        attachOrgId();
        break;
      default:
        break;
    }
    return params;
  }, [currentFolderType, isOrgPage, orgId, teamId]);
}

export default useGetAllFolderParams;
