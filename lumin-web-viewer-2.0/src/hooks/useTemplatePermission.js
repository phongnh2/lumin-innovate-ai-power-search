import { shallowEqual, useSelector } from 'react-redux';
import { templateServices } from 'services';
import selectors from 'selectors';
import useGetCurrentTeam from './useGetCurrentTeam';

export const useTemplatePermission = (template) => {
  const currentTeam = useGetCurrentTeam();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const { userRole: organizationUserRole } = currentOrganization.data || {};
  const { roleOfUser: teamUserRole } = currentTeam || {};
  const { belongsTo, permissions } = template || {};

  const isManagerOfOrgTemplate = templateServices.isManagerOfOrgTemplate(belongsTo.type, organizationUserRole);
  const isManagerOfTeamTemplate = templateServices.isManagerOfTeamTemplate(belongsTo.type, teamUserRole);

  return {
    canEdit: permissions.canEdit || isManagerOfOrgTemplate || isManagerOfTeamTemplate,
    canDelete: permissions.canDelete || isManagerOfOrgTemplate || isManagerOfTeamTemplate,
  };
};
