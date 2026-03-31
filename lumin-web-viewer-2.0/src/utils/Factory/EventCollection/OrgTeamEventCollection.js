import { AWS_EVENTS } from 'constants/awsEvents';
import { EventCollection } from './EventCollection';

export class OrgTeamEventCollection extends EventCollection {
  create({ name, teamId }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION_TEAM.CREATE,
      attributes: {
        name,
        teamId,
      },
    });
  }

  delete({ name, teamId }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION_TEAM.DELETE,
      attributes: {
        name,
        teamId,
      },
    });
  }

  addMember({ teamId, newMemberUserId }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION_TEAM.ADD_MEMBER,
      attributes: {
        teamId,
        newMemberUserId,
      },
    });
  }

  removeMember({ teamId, removedMemberUserId }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION_TEAM.REMOVE_MEMBER,
      attributes: {
        teamId,
        removedMemberUserId,
      },
    });
  }
}

export default new OrgTeamEventCollection();
