import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import CustomHeader from 'lumin-components/CustomHeader';

import 'luminComponents/Shared/Dashboard.scss';
import { useTranslation } from 'hooks';

import PersonalDashboardActivities from './PersonalDashboardActivities';
import PersonalDashboardInsights from './PersonalDashboardInsights';

const getRoutes = (t) => [
  {
    id: '1',
    icon: 'insights',
    name: 'Insights',
    url: '/insights',
    component: PersonalDashboardInsights,
    metaTitle: t('metaTitle.dashboardInsights'),
    metaDescription: t('metaDescription.dashboardInsights'),
  },
  {
    id: '2',
    icon: 'activities',
    name: 'Activities',
    url: 'activities',
    component: PersonalDashboardActivities,
  },
];

function PersonalDashboard() {
  const { t } = useTranslation();
  const routes = getRoutes(t);

  return (
    <div className="PersonalDashboard_wrapper">
      <div className="Dashboard__container">
        <Routes>
          {routes.map((item) => (
            <Route
              key={item.id}
              path={item.url}
              element={
                <>
                  <CustomHeader metaTitle={item.metaTitle} description={item.metaDescription} title={item.metaTitle} />
                  <item.component />
                </>
              }
            />
          ))}
          <Route path="/" element={<Navigate to="/dashboard/insights" replace />} />
        </Routes>
      </div>
    </div>
  );
}

PersonalDashboard.defaultProps = {};

PersonalDashboard.propTypes = {};

export default PersonalDashboard;
