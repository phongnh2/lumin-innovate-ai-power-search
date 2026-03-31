import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import selectors from 'selectors';
import get from 'lodash/get';

import ActivityListItem from 'luminComponents/ActivityListItem';
import CollapsedList from 'luminComponents/CollapsedList/CollapsedList';
import './RecentActivities.scss';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import DisabledDataCollectionCard from 'luminComponents/DisabledDataCollectionCard';

import { DASHBOARD_TYPE } from 'constants/dashboardConstants';
import ActivityDataImage from 'assets/images/lock-allow.svg';
import { useTranslation } from 'hooks';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { commonUtils } from 'utils';

function RecentActivities(props) {
  const {
    title,
    description,
    viewAllLink,
    showViewAllAtBottom,
    showPagination,
    collapsedOnMobile,
    activities,
    loading,
    dashboardType,
    numberOfDummies,
    currentUser,
    goToDocumentLink,
  } = props;
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const renderActivities = () => {
    const dataCollection = get(currentUser.setting, 'dataCollection', true);
    if (loading) {
      return [...Array(numberOfDummies).keys()].map((item) => <ActivityListItem
        key={item}
        loading={loading}
      />);
    }
    if (dashboardType === DASHBOARD_TYPE.PERSONAL && !dataCollection) {
      return (
        <div className="RecentActivities__DisableData">
          <DisabledDataCollectionCard isLockActivities image={ActivityDataImage} />
        </div>
      );
    }
    const numberPageList = Array.from(Array(Math.ceil(activities.length / 5)).keys());
    const renderPaginationActivities = () => numberPageList.map((data, index) => (
      <div
        className={`RecentActivities__NumberPage RecentActivities__NumberPage--${data + 1 === page ? 'active' : ''}`}
        key={index}
        onClick={() => setPage(data + 1)}
        role="button"
        tabIndex={0}
      >
        {data + 1}
      </div>));
    return activities.length
      ? (
        <>
          {activities.slice(5 * (page - 1), 5 * page).map((activity) => <ActivityListItem
            key={activity._id}
            activity={activity}
            loading={loading}
          />)}
          {showPagination &&
          <div className="RecentActivities__Pagination">
            <p className="RecentActivities__PaginationText">
              {t('teamInsight.showingActivities', {
                text: activities.length > 5 ? '5' : activities.length,
                text1: activities.length,
              })}
            </p>
            <div className="RecentActivities__PaginationContainer">
              { numberPageList.length > 1 && renderPaginationActivities()}
            </div>
          </div>}
          {showViewAllAtBottom && (
            <div className="RecentActivities__ViewAll--bottom">
              <Link className="RecentActivities__Link" to={viewAllLink}>
                {t('common.viewAll')}
              </Link>
            </div>
          )}
        </>
      )
      : (
        <div className="RecentActivities__Empty">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img className="RecentActivities__EmptyImg" src="/assets/images/go-to-document-page.svg" />
          <span className="RecentActivities__EmptyText">{t('teamInsight.recentActivitiesEmptyText')}</span>
          <ButtonMaterial
            className="RecentActivities__EmptyButton"
            color={ButtonColor.SECONDARY_RED}
            size={ButtonSize.XL}
            component={Link}
            to={goToDocumentLink}
          >
            {t('teamInsight.goToDocumentPage')}
          </ButtonMaterial>
        </div>
      );
  };

  return (
    <div className="RecentActivities__Container">
      <div className={`RecentActivities__Container-Desktop RecentActivities__CollapsedOnMobile--${collapsedOnMobile}`}>
        {title !== '' && (
          <div className="RecentActivities__Header">
            <h4 className="RecentActivities__Title">{commonUtils.formatTitleCaseByLocale(title)}</h4>
            <p className="RecentActivities__Description">{description}</p>
            {viewAllLink !== '' && <Link className="RecentActivities__Link" to={viewAllLink}>{t('common.viewAll')}l</Link>}
          </div>
        )}
        {renderActivities()}
      </div>
      {collapsedOnMobile && (
        <div className="RecentActivities__Container-Mobile">
          <CollapsedList renderHeader={() => <h4 className="RecentActivities__Title">{commonUtils.formatTitleCaseByLocale(title)}</h4>}>
            {renderActivities()}
          </CollapsedList>
        </div>
      )}
    </div>
  );
}

RecentActivities.defaultProps = {
  title: '',
  description: '',
  viewAllLink: '',
  collapsedOnMobile: false,
  loading: true,
  dashboardType: '',
  showViewAllAtBottom: false,
  showPagination: false,
  numberOfDummies: 5,
  goToDocumentLink: '/documents',
};

RecentActivities.propTypes = {
  currentUser: PropTypes.object.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  viewAllLink: PropTypes.string,
  collapsedOnMobile: PropTypes.bool,
  activities: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  dashboardType: PropTypes.string,
  showViewAllAtBottom: PropTypes.bool,
  showPagination: PropTypes.bool,
  numberOfDummies: PropTypes.number,
  goToDocumentLink: PropTypes.string,
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

export default connect(mapStateToProps)(RecentActivities);
