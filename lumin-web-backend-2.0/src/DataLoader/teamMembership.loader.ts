import * as DataLoader from 'dataloader';

import { IMembership } from 'Membership/interfaces/membership.interface';
import { TeamService } from 'Team/team.service';

export class TeamMembershipLoader {
  public static create(teamService: TeamService): DataLoader<string, IMembership> {
    return new DataLoader<string, IMembership>(async (ids: string[]) => {
      // Key: `${userId}-${teamId}`
      const teamIds = ids.map((id) => id.split('-')[1]);
      const userId = ids[0].split('-')[0];
      const teamMemberships = await teamService.getMemberships({ teamId: { $in: teamIds }, userId });
      const membershipsMap = teamMemberships.reduce((map, membership) => {
        const key = `${membership.userId.toHexString()}-${membership.teamId.toHexString()}`;
        map[key] = membership;
        return map;
      }, {});
      return ids.map((id) => membershipsMap[id]);
    });
  }
}
