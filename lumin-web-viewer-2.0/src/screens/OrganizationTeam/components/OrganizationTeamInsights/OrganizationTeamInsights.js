import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';

import selectors from 'selectors';

import { PlanContent } from 'lumin-components/InsightsPlanCard/constants/insightPlan';
import DashboardAreaChart from 'luminComponents/DashboardAreaChart';
import DashboardCard from 'luminComponents/DashboardCard';
import DashboardWelcome from 'luminComponents/DashboardWelcome';
import InsightsCommentCard from 'luminComponents/InsightsCommentCard';
import InsightsPlanCard from 'luminComponents/InsightsPlanCard';
import InsightsStats from 'luminComponents/InsightsStats';
import RecentActivities from 'luminComponents/RecentActivities';

import { useTranslation } from 'hooks';

import { dateUtil } from 'utils';

import { DASHBOARD_TYPE } from 'constants/dashboardConstants';
import { ORG_TEXT } from 'constants/organizationConstants';
import { TEAM_TEXT } from 'constants/teamConstant';

import {
  StyledDocumentCountContainer,
  StyledDocumentInsightContainer,
  StyledDocumentChartContainer,
  StyledActivitiesContainer,
} from './OrganizationTeamInsights.styled';

const propTypes = {
  currentTeam: PropTypes.object,
  currentOrganization: PropTypes.object,
  documentStatistics: PropTypes.object,
  commentsStatistic: PropTypes.object,
  recentActivities: PropTypes.array,
  activitiesLoading: PropTypes.bool,
  insightsLoading: PropTypes.bool,
  totalDocument: PropTypes.number,
};

const defaultProps = {
  currentTeam: {},
  currentOrganization: {},
  documentStatistics: {},
  commentsStatistic: {},
  recentActivities: [],
  activitiesLoading: true,
  insightsLoading: true,
  totalDocument: 0,
};

function OrganizationTeamInsights(props) {
  const {
    currentTeam,
    currentOrganization,
    documentStatistics,
    commentsStatistic,
    recentActivities,
    activitiesLoading,
    insightsLoading,
    totalDocument,
  } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const orgUrl = get(currentOrganization, 'data.url');
  const orgTeamDocumentsUrl = `/${ORG_TEXT}/${orgUrl}/documents/${TEAM_TEXT}/${currentTeam._id}`;

  /**
   * TODO: Refactor this block code when
   * org payment feature is implemented
   */
  const getPlanContent = useCallback(() => {
    const planType = get(currentOrganization, 'data.payment.type');
    if (planType) {
      return PlanContent.OrganizationTeam[planType];
    }
    return null;
  }, [currentOrganization]);

  const getLastUpdated = () => {
    if (!recentActivities || recentActivities.length === 0) return null;

    return dateUtil.formatFullDateName(recentActivities[0].eventTime);
  };

  const lastUpdated = getLastUpdated();

  return (
    <>
      <DashboardWelcome type={DASHBOARD_TYPE.TEAM} team={currentTeam} lastUpdated={lastUpdated} />
      <div className="DashboardContent__View DashboardContent__OrgTeamView">
        <div className="DashboardContent__ViewLeft">
          <DashboardCard
            title={t('teamInsight.teamDocuments')}
            iconName="single-mode"
            rightIcon="arrow-right"
            onRightLinkClick={() => navigate(orgTeamDocumentsUrl)}
          >
            <StyledDocumentInsightContainer>
              <StyledDocumentCountContainer>
                <InsightsStats
                  value={totalDocument}
                  title={t('insightPage.totalDocuments')}
                  rating={documentStatistics?.rating}
                  isIncrease={documentStatistics?.isIncrease}
                  loading={insightsLoading}
                  isDocument
                />
              </StyledDocumentCountContainer>
              <StyledDocumentChartContainer>
                <DashboardAreaChart
                  isIncrease={documentStatistics?.isIncrease}
                  data={documentStatistics?.data}
                  loading={insightsLoading}
                  textColor="white"
                />
              </StyledDocumentChartContainer>
            </StyledDocumentInsightContainer>
          </DashboardCard>
          <StyledActivitiesContainer>
            <RecentActivities
              title={t('insightPage.recentActivities')}
              description={recentActivities.length ? t('insightPage.theseAreYour15NewestActivitiesInLumin') : ''}
              activities={recentActivities}
              loading={activitiesLoading}
              dashboardType={DASHBOARD_TYPE.TEAM}
              showPagination
              goToDocumentLink={orgTeamDocumentsUrl}
            />
          </StyledActivitiesContainer>
        </div>
        <div>
          <div className="DashboardContent__ViewRight">
            <div className="DashboardContent__ViewRightItem">
              <InsightsCommentCard
                totalComments={commentsStatistic?.totalComments}
                rating={commentsStatistic?.rating}
                isIncrease={commentsStatistic?.isIncrease}
                data={commentsStatistic?.data}
                loading={insightsLoading}
              />
            </div>
            <div className="DashboardContent__ViewRightItem">
              <InsightsPlanCard type={DASHBOARD_TYPE.ORG_TEAM} planContent={getPlanContent()} customImgClassName="InsightsPlanCard__Img--team" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

OrganizationTeamInsights.propTypes = propTypes;
OrganizationTeamInsights.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
});

export default connect(mapStateToProps)(OrganizationTeamInsights);
