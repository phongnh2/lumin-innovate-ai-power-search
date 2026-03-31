import { Grid } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import SvgElement from 'lumin-components/SvgElement';
import MaterialAvatar from 'luminComponents/MaterialAvatar';

import avatarUtils from 'utils/avatar';
import dateUtils from 'utils/date';

import UserEventConstants from 'constants/eventConstants';

import './ActivityListItem.scss';
import ActivityDocumentItem from './ActivityDocumentItem';
import ActivityListItemSkeleton from './ActivityListItemSkeleton';
import ActivityTeamItem from './ActivityTeamItem';

function ActivityListItem(props) {
  const {
    activity,
    loading,
  } = props;
  const {
    actor, eventName, eventTime, document, eventType,
  } = activity;

  const isDocumentEvent = eventType === UserEventConstants.EventType.DOCUMENT;

  const renderContent = () => {
    switch (activity.eventType) {
      case UserEventConstants.EventType.DOCUMENT:
        return <ActivityDocumentItem activity={activity} />;
      case UserEventConstants.EventType.TEAM:
        return <ActivityTeamItem activity={activity} />;
      default:
        return null;
    }
  };

  const onActivityClick = () => {
    const { _id: documentId } = document || {};
    if (isDocumentEvent && documentId) {
      window.open(`/viewer/${documentId}`);
    }
  };

  if (loading) {
    return <ActivityListItemSkeleton />;
  }

  const shouldRenderAppLogo = [
    UserEventConstants.Events.TeamEvents.TEAM_PLAN_RENEWED,
    UserEventConstants.Events.TeamEvents.TEAM_PLAN_CHANGED,
  ].includes(eventName);

  return (
    <div className="ActivityItem__container" onClick={onActivityClick} role="button" tabIndex="0">
      <div className="ActivityItem__AvatarContainer">
        {shouldRenderAppLogo ? (
          <div className="ActivityItem__AppLogo">
            <SvgElement
              content="lumin-symbol"
              width={32}
              height={32}
            />
          </div>
        ) : (
          <MaterialAvatar
            containerClasses="MaterialAvatar__border--mobile-off"
            size={32}
            src={avatarUtils.getAvatar(actor.avatarRemoteId)}
            hasBorder
          >
            {avatarUtils.getTextAvatar(actor.name)}
          </MaterialAvatar>
        )}
        <div />
      </div>
      <Grid container spacing={0} direction="row" alignItems="center" className="ActivityItem__ContentContainer">
        <Grid item xs={12} sm={8}>
          {renderContent()}
        </Grid>
        <Grid item xs={12} sm={4}>
          <span className="ActivityItem__Date">{dateUtils.formatFullDate(new Date(eventTime))}</span>
        </Grid>
      </Grid>
    </div>
  );
}

ActivityListItem.propTypes = {
  activity: PropTypes.object,
  loading: PropTypes.bool,
};

ActivityListItem.defaultProps = {
  activity: {},
  loading: true,
};

export default ActivityListItem;
