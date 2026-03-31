import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';
import { folderType } from 'constants/documentConstants';
import { organizationServices, teamServices } from 'services';
import { useGetCurrentTeam, useGetFolderType } from 'hooks';

export function useValidateDocumentRemoval() {
  const currentFolderType = useGetFolderType();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const currentTeam = useGetCurrentTeam();

  switch (currentFolderType) {
    case folderType.INDIVIDUAL:
      return true;
    case folderType.ORGANIZATION:
      return organizationServices.isManager(currentOrganization.userRole);
    case folderType.TEAMS:
      return teamServices.isOrgTeamAdmin(currentTeam.roleOfUser?.toUpperCase());
    case folderType.STARRED:
      return false;
    default:
      return true;
  }
}
