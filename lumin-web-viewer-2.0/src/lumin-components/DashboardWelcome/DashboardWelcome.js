import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import selectors from 'selectors';
import { DASHBOARD_TYPE } from 'constants/dashboardConstants';
import { useTranslation } from 'hooks';
import './DashboardWelcome.scss';

function DashboardWelcome({
  type,
  team,
  organization,
  lastUpdated,
}) {
  const { t } = useTranslation();
  const currentUser = useSelector(selectors.getCurrentUser);

  const textHello = () => t('common.hello');

  switch (type) {
    case DASHBOARD_TYPE.PERSONAL:
      return (
        <div className="DashboardWelcome">
          <span className="DashboardWelcome__Title">{textHello()}, {currentUser.name}!</span>
          <div className="DashboardWelcome__Description">
            <span className="DashboardWelcome__Text">{t('insightPage.welcomeToPersonalDashboard')}</span>
            {lastUpdated && <span className="DashboardWelcome__LastUpdated">{`${t('common.lastUpdated')}: ${lastUpdated}`}</span>}
          </div>
        </div>
      );
    case DASHBOARD_TYPE.TEAM:
      return (
        <div className="DashboardWelcome">
          <span className="DashboardWelcome__Title">{textHello()}, {currentUser.name}!</span>
          <div className="DashboardWelcome__Description">
            {team?.name && (<span className="DashboardWelcome__Text">{t('insightPage.welcomeToTeam', { name: team.name })}</span>)}
            {lastUpdated && <span className="DashboardWelcome__LastUpdated">{`${t('common.lastUpdated')}: ${lastUpdated}`}</span>}
          </div>
        </div>
      );
    case DASHBOARD_TYPE.ORGANIZATION:
      return (
        <div className="DashboardWelcome DashboardWelcome__Organization">
          <span className="DashboardWelcome__Title">{textHello()}, {currentUser.name}!</span>
          <span className="DashboardWelcome__Text">{t('insightPage.welcomeToOrg', { name: organization.name })}</span>
        </div>
      );
    default:
      return null;
  }
}

DashboardWelcome.defaultProps = {
  team: {},
  organization: {},
  lastUpdated: '',
};

DashboardWelcome.propTypes = {
  type: PropTypes.string.isRequired,
  team: PropTypes.object,
  organization: PropTypes.object,
  lastUpdated: PropTypes.string,
};

DashboardWelcome.defaultProps = {};

export default DashboardWelcome;
