import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useMatch } from 'react-router-dom';

import selectors from 'selectors';

import { ORG_PATH } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';
import { TEMPLATE_TABS } from 'constants/templateConstant';

import useGetCurrentTeam from './useGetCurrentTeam';

export function useCurrentTemplateList() {
  const isInOrgPage = Boolean(useMatch(ORG_PATH));

  const match = useMatch({
    path: [ROUTE_MATCH.ORGANIZATION_TEMPLATES, ROUTE_MATCH.PERSONAL_TEMPLATES],
    end: false,
  });
  const { _id: currentTeamId } = useGetCurrentTeam(ROUTE_MATCH.ORGANIZATION_TEAM_TEMPLATES);
  const { _id: currentUserId } = useSelector(selectors.getCurrentUser, shallowEqual);
  const { _id: organizationId } = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const { type: templateType } = match.params;

  const getClientId = useMemo(() => {
    let clientIdMapping;

    if (isInOrgPage) {
      clientIdMapping = {
        [TEMPLATE_TABS.ALL]: organizationId,
        [TEMPLATE_TABS.PERSONAL]: organizationId,
        [TEMPLATE_TABS.TEAM]: currentTeamId,
        [TEMPLATE_TABS.ORGANIZATION]: organizationId,
      };
    } else {
      clientIdMapping = {
        [TEMPLATE_TABS.PERSONAL]: currentUserId,
        [TEMPLATE_TABS.TEAM]: currentTeamId,
        [TEMPLATE_TABS.ORGANIZATION]: organizationId,
      };
    }

    return clientIdMapping[templateType];
  }, [isInOrgPage, templateType, organizationId, currentTeamId, currentUserId]);

  return [templateType, getClientId];
}
