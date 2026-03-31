import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import selectors from 'selectors';
import get from 'lodash/get';

import { useTranslation } from 'hooks';
import DashboardCard from 'luminComponents/DashboardCard';
import InsightsStats from 'luminComponents/InsightsStats';
import DashboardAreaChart from 'luminComponents/DashboardAreaChart';
import DisabledDataCollectionCard from 'luminComponents/DisabledDataCollectionCard';
import { DASHBOARD_TYPE } from 'constants/dashboardConstants';
import CommentDataImage from 'assets/images/lock-allow.svg';
import './InsightsCommentCard.scss';

function InsightsCommentCard(props) {
  const {
    totalComments,
    rating,
    isIncrease,
    data,
    loading,
    currentUser,
    type,
  } = props;
  const { t } = useTranslation();

  const renderCommentStats = () => {
    const dataCollection = get(currentUser.setting, 'dataCollection', true);
    const isPersonalDashboard = type === DASHBOARD_TYPE.PERSONAL;
    return (isPersonalDashboard && !dataCollection)
      ? <DisabledDataCollectionCard image={CommentDataImage} isLockActivities />
      : (
        <>
          <InsightsStats
            value={totalComments}
            rating={rating}
            title={t('insightPage.totalComments')}
            isIncrease={isIncrease}
            loading={loading}
          />
          <div className="InsightsComment__ChartContainer">
            <div className="InsightsComment__Chart">
              <DashboardAreaChart
                data={data}
                isIncrease={isIncrease}
                loading={loading}
              />
            </div>
          </div>
        </>
      );
  };

  return (
    <DashboardCard
      isComment
      containerClaseses={`InsightsComment__Container ${!loading && data.length === 0 ? 'InsightsComment__Container--no-chart' : ''}`}
      title={t('common.comments')}
      iconName="annotation"
      iconSize={24}
    >
      {renderCommentStats()}
    </DashboardCard>
  );
}

InsightsCommentCard.propTypes = {
  currentUser: PropTypes.object.isRequired,
  totalComments: PropTypes.number,
  rating: PropTypes.number,
  isIncrease: PropTypes.bool,
  data: PropTypes.array,
  loading: PropTypes.bool,
  type: PropTypes.string,
};

InsightsCommentCard.defaultProps = {
  totalComments: 0,
  rating: 0,
  isIncrease: true,
  loading: true,
  data: [],
  type: '',
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

export default connect(mapStateToProps)(InsightsCommentCard);
