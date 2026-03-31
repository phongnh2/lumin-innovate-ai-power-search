import React from 'react';
import { upperFirst, camelCase } from 'lodash';
import { Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import UserEventConstants from 'constants/eventConstants';
import { useTranslation } from 'hooks';

const HighLight = <span className="ActivityItem__Content-Highlight" />;

function ActivityTeamItem(props) {
  const { activity } = props;
  const { actor, target, team } = activity;
  const { name: actorName } = actor || {};
  const { modification } = team;
  const { t } = useTranslation();

  let activityTitle = null;
  const i18nKey = `activityTeam.${camelCase(activity.eventName)}`;
  switch (activity.eventName) {
    case UserEventConstants.Events.TeamEvents.TEAM_MEMBER_ADDED:
    case UserEventConstants.Events.TeamEvents.TEAM_MEMBER_REMOVED:
      activityTitle = (
        <Trans
          i18nKey={i18nKey}
          components={{ b: HighLight }}
          values={{ actorName, target: target.name || target.email }}
        />
      );
      break;
    case UserEventConstants.Events.TeamEvents.TEAM_MEMBER_LEFT:
      activityTitle = <Trans i18nKey={i18nKey} components={{ b: HighLight }} values={{ actorName }} />;
      break;
    case UserEventConstants.Events.TeamEvents.TEAM_OWNERSHIP_TRANSFERED:
      activityTitle = (
        <Trans i18nKey={i18nKey} components={{ b: HighLight }} values={{ actorName, target: target.name }} />
      );
      break;
    case UserEventConstants.Events.TeamEvents.TEAM_MEMBER_ROLE_CHANGED:
      activityTitle = (
        <Trans
          i18nKey={i18nKey}
          components={{ b: HighLight }}
          values={{ actorName, target: target.name, role: upperFirst(modification.memberRole.toLowerCase()) }}
        />
      );
      break;
    case UserEventConstants.Events.TeamEvents.TEAM_PLAN_CANCELED:
      activityTitle = <Trans i18nKey={i18nKey} components={{ b: HighLight }} values={{ actorName }} />;
      break;
    case UserEventConstants.Events.TeamEvents.TEAM_PLAN_CHANGED:
    case UserEventConstants.Events.TeamEvents.TEAM_PLAN_RENEWED:
      activityTitle = t(i18nKey);
      break;
    default:
      break;
  }

  return (
    <span className="ActivityItem__Content-Team">
      {activityTitle}
    </span>
  );
}

ActivityTeamItem.propTypes = {
  activity: PropTypes.object.isRequired,
};

export default ActivityTeamItem;
