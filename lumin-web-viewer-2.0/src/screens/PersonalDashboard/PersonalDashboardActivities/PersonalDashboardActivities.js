import React from 'react';
import { useQuery } from '@apollo/client';
import classNames from 'classnames';

import { PERSONAL_ACTIVITIES } from 'graphQL/DashboardGraph';
import { DASHBOARD_TYPE, NUMBER_OF_ACTIVITIES } from 'constants/dashboardConstants';
import RecentActivities from 'luminComponents/RecentActivities';
import UserEventConstants from 'constants/eventConstants';

import PersonalDashboardAvatar from '../PersonalDashboardAvatar';
import PersonalDashboardTabs from '../PersonalDashboardTabs';

function PersonalDashboardActivities() {
  const { data: { activities: activitiesData = [] } = {}, loading } = useQuery(PERSONAL_ACTIVITIES, {
    fetchPolicy: 'no-cache',
    variables: {
      limit: NUMBER_OF_ACTIVITIES.ACTIVITIES,
    },
  });

  const transformActivities = () => activitiesData.map(UserEventConstants.object);
  const activities = transformActivities();

  return (
    <>
      <div className="DashboardContent__TitleWrapper">
        <PersonalDashboardAvatar />
        <PersonalDashboardTabs />
      </div>
      <div className={classNames({ DashboardContent__card: activities.length > 0 || loading })}>
        <RecentActivities
          activities={activities}
          loading={loading}
          dashboardType={DASHBOARD_TYPE.PERSONAL}
          goToDocumentLink="/documents"
        />
      </div>
    </>
  );
}

export default PersonalDashboardActivities;
