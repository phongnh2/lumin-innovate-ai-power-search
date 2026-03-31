/* eslint-disable class-methods-use-this */
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

import DocumentDataImage from 'assets/images/document-data-log.svg';

import selectors from 'selectors';

import DashboardCard from 'luminComponents/DashboardCard';
import DashboardWelcome from 'luminComponents/DashboardWelcome';
import DisabledDataCollectionCard from 'luminComponents/DisabledDataCollectionCard';
import InsightsCommentCard from 'luminComponents/InsightsCommentCard';
import InsightsStats from 'luminComponents/InsightsStats';
import PieChart from 'luminComponents/PieChart';
import RecentActivities from 'luminComponents/RecentActivities';

import { dashboardServices } from 'services';

import { dateUtil } from 'utils';

import { DASHBOARD_TYPE, NUMBER_OF_ACTIVITIES } from 'constants/dashboardConstants';
import UserEventConstants from 'constants/eventConstants';
import { Colors } from 'constants/styles';

import './PersonalDashboardInsights.scss';

class PersonalDashboardInsights extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      insightsLoading: true,
      activitiesLoading: true,
      documentStatistics: null,
      commentsStatistic: null,
      recentActivities: [],
    };
  }

  componentDidMount() {
    this.getDocumentStatistic();
    this.getRecentActivities();
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getTotalDocument = () => {
    const { documentStatistics } = this.state;
    const { ownedDocumentTotal = 0, sharedDocumentTotal = 0 } = documentStatistics || {};
    return ownedDocumentTotal + sharedDocumentTotal;
  };

  extractRating = (rating = 0) => ({
    rating: Math.abs(rating),
    isIncrease: rating >= 0,
  });

  getDocumentStatistic = async () => {
    const { insightsLoading } = this.state;
    try {
      if (!insightsLoading) {
        this.setState({
          insightsLoading: true,
        });
      }
      const {
        data: { insightsData },
      } = await dashboardServices.getPersonalInsightsDocuments();
      const { documentSummary, documentStat } = insightsData;
      if (!this._isMounted) {
        return;
      }
      this.setState({
        commentsStatistic: {
          totalComments: documentSummary?.commentTotal,
          ...this.extractRating(documentStat?.derivativeCommentRate),
          data: documentStat.dailyNewComments,
        },
        documentStatistics: {
          ownedDocumentTotal: documentSummary?.ownedDocumentTotal,
          sharedDocumentTotal: documentSummary?.sharedDocumentTotal,
          ...this.extractRating(documentStat?.derivativeDocumentRate),
        },
        insightsLoading: false,
      });
    } catch (error) {
      if (!this._isMounted) {
        return;
      }
      this.setState({
        insightsLoading: false,
      });
    }
  };

  getRecentActivities = async () => {
    const { activitiesLoading } = this.state;
    try {
      if (!activitiesLoading) {
        this.setState({
          activitiesLoading: true,
        });
      }
      const {
        data: { activities = [] },
      } = await dashboardServices.getPersonalActivities(NUMBER_OF_ACTIVITIES.ACTIVITIES);
      if (!this._isMounted) {
        return;
      }
      this.setState({
        recentActivities: activities.map(UserEventConstants.object),
        activitiesLoading: false,
      });
    } catch (error) {
      if (!this._isMounted) {
        return;
      }
      this.setState({
        recentActivities: [],
        activitiesLoading: false,
      });
    }
  };

  getLastUpdated = () => {
    const { recentActivities } = this.state;
    if (!recentActivities || recentActivities.length === 0) return null;

    return dateUtil.formatFullDateName(recentActivities[0].eventTime);
  };

  onDocumentLinkClick = () => {
    const { navigate } = this.props;
    navigate('/documents');
  };

  renderDocumentInsight = (dataCollection) => {
    const { t } = this.props;
    const { documentStatistics, insightsLoading } = this.state;
    const totalDocument = this.getTotalDocument();
    const { ownedDocumentTotal, sharedDocumentTotal } = documentStatistics || {};

    const segments = [
      {
        name: 'insightPage.yourDocuments1',
        value: ownedDocumentTotal,
        color: Colors.PRIMARY_40,
      },
      {
        name: 'insightPage.sharedDocuments',
        value: sharedDocumentTotal,
        color: Colors.OTHER_2,
      },
    ];
    return dataCollection ? (
      <div className="PersonalDashboardInsights__Documents">
        <div className="PersonalDashboardInsights__DocumentsCount">
          <InsightsStats
            isDocument
            value={totalDocument}
            title={t('insightPage.totalDocuments')}
            rating={documentStatistics?.rating}
            isIncrease={documentStatistics?.isIncrease}
            loading={insightsLoading}
          />
        </div>
        <div className="PersonalDashboardInsights__DocumentsChart">
          <PieChart segments={segments} loading={insightsLoading} />
        </div>
      </div>
    ) : (
      <div className="PersonalDashboardInsights__Documents PersonalDashboardInsights__Documents--disabled">
        <DisabledDataCollectionCard image={DocumentDataImage} />
      </div>
    );
  };

  render() {
    const { t } = this.props;
    const { setting } = this.props.currentUser;
    const { commentsStatistic, insightsLoading, recentActivities, activitiesLoading } = this.state;
    const dataCollection = get(setting, 'dataCollection', true);
    const lastUpdated = this.getLastUpdated();
    return (
      <>
        <div className="DashboardContent__InsightContainer">
          <h1 className="DashboardContent__TitleInsight">{t('common.insights')}</h1>
        </div>
        <div className="DashboardContent__Wrapper">
          <DashboardWelcome type={DASHBOARD_TYPE.PERSONAL} lastUpdated={lastUpdated} />
          <div className="DashboardContent__View">
            <div className="DashboardContent__ViewLeftContainer">
              <div className="DashboardContent__ViewLeft">
                <DashboardCard
                  title={t('insightPage.yourDocuments')}
                  iconName="single-mode"
                  rightIcon="arrow-right"
                  onRightLinkClick={this.onDocumentLinkClick}
                >
                  {this.renderDocumentInsight(dataCollection)}
                </DashboardCard>
              </div>
              <div className="DashboardContent__ViewLeft">
                <RecentActivities
                  title={t('insightPage.recentActivities')}
                  description={recentActivities.length ? t('insightPage.theseAreYour15NewestActivitiesInLumin') : ''}
                  activities={recentActivities}
                  loading={activitiesLoading}
                  dashboardType={DASHBOARD_TYPE.PERSONAL}
                  showPagination
                  goToDocumentLink="/documents"
                />
              </div>
            </div>
            <div className="DashboardContent__ViewRight">
              <div className="DashboardContent__ViewRightItem">
                <InsightsCommentCard
                  totalComments={commentsStatistic?.totalComments}
                  rating={commentsStatistic?.rating}
                  isIncrease={commentsStatistic?.isIncrease}
                  data={commentsStatistic?.data}
                  loading={insightsLoading}
                  type={DASHBOARD_TYPE.PERSONAL}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

PersonalDashboardInsights.propTypes = {
  currentUser: PropTypes.object.isRequired,
  navigate: PropTypes.func,
  t: PropTypes.func,
};

PersonalDashboardInsights.defaultProps = {
  navigate: () => {},
  t: () => {},
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = () => ({});

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(PersonalDashboardInsights);
