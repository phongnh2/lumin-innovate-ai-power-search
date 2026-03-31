/* eslint-disable class-methods-use-this */
import { LOGGER } from 'constants/lumin-common';
import logger from 'helpers/logger';
import orgTeamEvent from 'utils/Factory/EventCollection/OrgTeamEventCollection';

class TeamTracking {
  trackCreate(team) {
    const { _id, name } = team;
    orgTeamEvent.create({
      name,
      teamId: _id,
    });
  }

  trackDelete(team) {
    const { _id: teamId, name } = team;
    orgTeamEvent.delete({
      name,
      teamId,
    });
  }

  trackInviteMember({ teamId, members }) {
    members.forEach(({ userId }) => {
      orgTeamEvent.addMember({
        teamId,
        newMemberUserId: userId,
      });
    });

    // Log info to Datadog
    logger.logInfo({
      message: LOGGER.EVENT.INVITE_MEMBER_TO_TEAM,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
      attributes: {
        addedUserId: members.map((member) => member.userId),
      },
    });
    members.forEach((member) => {
      logger.logInfo({
        message: LOGGER.EVENT.INVITED_TO_TEAM,
        reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
        attributes: {
          addedUserId: member.userId,
        },
      });
    });
  }

  trackRemoveMember({
    teamId,
    removedMemberUserId,
  }) {
    orgTeamEvent.removeMember({
      teamId,
      removedMemberUserId,
    });

    // Log info to Datadog
    logger.logInfo({
      message: LOGGER.EVENT.REMOVE_MEMBER_FROM_TEAM,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
      attributes: {
        removedUserId: removedMemberUserId,
      },
    });
    logger.logInfo({
      message: LOGGER.EVENT.REMOVED_FROM_TEAM,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
      attributes: {
        removedUserId: removedMemberUserId,
      },
    });
  }
}

export default new TeamTracking();
