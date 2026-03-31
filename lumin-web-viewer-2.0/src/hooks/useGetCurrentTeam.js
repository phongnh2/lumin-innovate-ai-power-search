import { find } from 'lodash';
import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import selectors from 'selectors';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

import useHomeMatch from './useHomeMatch';

const useGetCurrentTeam = (
  paths = [
    ROUTE_MATCH.TEAM_DOCUMENT,
    ROUTE_MATCH.ORGANIZATION_FOLDER_DOCUMENT.TEAM,
    ROUTE_MATCH.ORGANIZATION_TEAM_TEMPLATES,
  ]
) => {
  const location = useLocation();
  const { isTrendingTab } = useHomeMatch();

  const { selectedTeam } = useSelector(selectors.getTeamSelectorData);

  const { params } =
    matchPaths(
      paths.map((path) => ({ path })),
      location.pathname
    ) || {};

  const { teamId } = params || {};
  const { data: currentOrganization } = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const { teams = [] } = currentOrganization || {};

  const foundTeam = useMemo(() => find(teams, { _id: teamId }) || {}, [teams, teamId]);

  if (isTrendingTab) {
    return selectedTeam || {};
  }
  return foundTeam;
};

useGetCurrentTeam.propTypes = {};

export default useGetCurrentTeam;
