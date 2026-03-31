import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import OrganizationTeamContext from 'screens/OrganizationTeam/Context';

import { dashboardServices } from 'services';

import { NUMBER_OF_ACTIVITIES } from 'constants/dashboardConstants';
import UserEventConstants from 'constants/eventConstants';

const TeamInsightHOC = (WrappedComponent) => {
  const propTypes = {
    currentOrganization: PropTypes.object,
  };

  const defaultProps = {
    currentOrganization: {},
  };

  class TeamInsightWrapper extends React.Component {
    _isMounted = false;

    constructor(props) {
      super(props);
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

    // eslint-disable-next-line class-methods-use-this
    extractRating = (rating = 0) => ({
      rating: Math.abs(rating),
      isIncrease: rating >= 0,
    });

    getDocumentStatistic = async () => {
      const { currentTeam = {} } = this.context;
      const { insightsLoading } = this.state;
      try {
        if (!insightsLoading) {
          this.setState({
            insightsLoading: true,
          });
        }
        const {
          data: { insightsData },
        } = await dashboardServices.getTeamInsightsDocuments(currentTeam._id);
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
            data: documentStat.dailyNewDocuments,
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
      const { currentTeam = {} } = this.context;
      try {
        if (!activitiesLoading) {
          this.setState({
            activitiesLoading: true,
          });
        }
        const {
          data: { activities = [] },
        } = await dashboardServices.getTeamActivities(currentTeam._id, NUMBER_OF_ACTIVITIES.INSIGHTS);
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

    render() {
      return <WrappedComponent {...this.props} {...this.state} totalDocument={this.getTotalDocument()} />;
    }
  }
  TeamInsightWrapper.propTypes = propTypes;
  TeamInsightWrapper.defaultProps = defaultProps;
  TeamInsightWrapper.contextType = OrganizationTeamContext;

  const mapStateToProps = (state) => ({
    currentOrganization: selectors.getCurrentOrganization(state),
  });

  const mapDispatchToProps = () => ({});

  return connect(mapStateToProps, mapDispatchToProps)(TeamInsightWrapper);
};

export default TeamInsightHOC;
