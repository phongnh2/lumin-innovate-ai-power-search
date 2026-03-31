import { useQuery } from '@apollo/client';
import i18next from 'i18next';
import { merge } from 'lodash';
import PropTypes from 'prop-types';
import React, { useMemo, memo, Suspense, useCallback } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { useParams } from 'react-router';
import { compose } from 'redux';

import { TEAM } from 'graphQL/TeamGraph';

import selectors from 'selectors';

import CircularLoading from 'luminComponents/CircularLoading';
import OrganizationTeamHeader from 'luminComponents/OrganizationTeamHeader';
import TeamNotFound from 'luminComponents/TeamNotFound';

import withRedirectTeamDashboard from 'HOC/withRedirectTeamDashboard';
import withRouter from 'HOC/withRouter';
import UpdateTeamSubscriber from 'src/HOC/UpdateTeamSubscriber';

import { useEnableWebReskin, useGetMetaTitle } from 'hooks';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import 'luminComponents/Shared/Dashboard.scss';

import { FETCH_POLICY } from 'constants/graphConstant';
import { ORG_TEAM_ROLE } from 'constants/organizationConstants';

import Context from './Context';

import { StyledTeamHeaderContainer, StyledTeamLoading } from './OrganizationTeam.styled';

import styles from './OrganizationTeam.module.scss';

const TeamMembersLazy = lazyWithRetry(() => import('luminComponents/TeamMembers'));
const TeamSettingsLazy = lazyWithRetry(() => import('luminComponents/TeamSettings'));
const TeamInsightsLazy = lazyWithRetry(() => import('./components/OrganizationTeamInsights'));

const tabNames = {
  INSIGHTS: 'insights',
  MEMBERS: 'members',
  SETTINGS: 'settings',
};

const teamRoutes = [
  {
    id: tabNames.INSIGHTS,
    value: tabNames.INSIGHTS,
    label: i18next.t(`common.${tabNames.INSIGHTS}`),
    component: TeamInsightsLazy,
    admin: true,
  },
  {
    id: tabNames.MEMBERS,
    value: tabNames.MEMBERS,
    label: i18next.t(`common.${tabNames.MEMBERS}`),
    component: TeamMembersLazy,
    admin: false,
  },
  {
    id: tabNames.SETTINGS,
    value: tabNames.SETTINGS,
    label: i18next.t(`common.${tabNames.SETTINGS}`),
    component: TeamSettingsLazy,
    admin: true,
  },
];

const propsTypes = {
  organization: PropTypes.object,
  match: PropTypes.object,
};
const defaultProps = {
  organization: {},
  match: {},
};

function OrganizationTeam({ organization, match }) {
  const { isEnableReskin } = useEnableWebReskin();
  const { getMetaTitle } = useGetMetaTitle();
  // const navigate = useNavigate();
  const { id: teamId } = match.params;
  const { data: currentOrganization, loading: isFetchingOrganization } = organization;
  const { tab: currentTab } = useParams();
  // useEffect(() => {
  //   if (Object.values(tabNames).includes(currentTab)) {
  //     navigate(`/${ORG_TEXT}/${currentOrganization.url}/teams/${teamId}/${currentTab}`, { replace: true });
  //   }
  // }, []);
  const {
    loading,
    data,
    refetch: refetchTeam,
    error,
    client,
  } = useQuery(TEAM, {
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      teamId,
    },
  });
  const currentTeam = data?.team;
  const { roleOfUser = '' } = currentTeam || {};

  const updateTeam = useCallback(
    () => (newData) => {
      const oldData = client.readQuery({
        query: TEAM,
        variables: {
          teamId,
        },
      });
      client.writeQuery({
        query: TEAM,
        variables: {
          teamId,
        },
        data: {
          team: merge({ ...oldData.team }, newData),
        },
      });
    },
    [client, teamId]
  );

  const filteredRoutes = useMemo(() => {
    const isAdmin = roleOfUser.toUpperCase() === ORG_TEAM_ROLE.ADMIN;
    return teamRoutes.filter((route) => isAdmin || !route.admin);
  }, [roleOfUser]);

  const renderTables = useMemo(() => {
    switch (currentTab) {
      case tabNames.INSIGHTS:
        return <TeamInsightsLazy refetchTeamDetail={refetchTeam} currentTeam={currentTeam} updateTeam={updateTeam} />;
      case tabNames.MEMBERS:
        return <TeamMembersLazy refetchTeamDetail={refetchTeam} currentTeam={currentTeam} updateTeam={updateTeam} />;
      case tabNames.SETTINGS:
        return <TeamSettingsLazy refetchTeamDetail={refetchTeam} currentTeam={currentTeam} updateTeam={updateTeam} />;
      default:
        return null;
    }
  }, [currentTab, currentTeam, refetchTeam, updateTeam]);

  const loadingComponent = useMemo(
    () => (
      <StyledTeamLoading>
        <CircularLoading size={30} />
      </StyledTeamLoading>
    ),
    []
  );

  const context = useMemo(
    () => ({
      currentTeam,
      refetchTeam,
      updateTeam,
    }),
    [currentTeam, refetchTeam, updateTeam]
  );

  if (loading || isFetchingOrganization) {
    return loadingComponent;
  }

  if (error || !currentTeam) {
    return <TeamNotFound fullscreen={false} />;
  }

  return (
    <>
      <Helmet>
        <title>{getMetaTitle(`${currentTeam.name} | ${currentOrganization.name}`)}</title>
      </Helmet>
      <Context.Provider value={context}>
        <div className={isEnableReskin ? styles.teamContainer : ''}>
        <StyledTeamHeaderContainer>
          <OrganizationTeamHeader teamTabs={filteredRoutes} organization={organization} />
        </StyledTeamHeaderContainer>
        <UpdateTeamSubscriber currentTeam={currentTeam}>
          <Suspense fallback={loadingComponent}>{renderTables}</Suspense>
        </UpdateTeamSubscriber>
        </div>
      </Context.Provider>
    </>
  );
}

OrganizationTeam.propTypes = propsTypes;
OrganizationTeam.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  organization: selectors.getCurrentOrganization(state),
});

export default compose(connect(mapStateToProps), withRouter, withRedirectTeamDashboard)(memo(OrganizationTeam));
