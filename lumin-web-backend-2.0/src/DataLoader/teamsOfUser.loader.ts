import * as DataLoader from 'dataloader';

import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';

export class TeamsOfUserLoader {
  public static create(teamService: TeamService): DataLoader<string, ITeam[]> {
    return new DataLoader<string, ITeam[]>(async (ids: string[]) => {
      // Key: `${userId}-${orgId}`
      const orgIds = ids.map((id) => id.split('-')[1]);
      const userId = ids[0].split('-')[0];
      const teamsOfOrg = await teamService.find({ belongsTo: { $in: orgIds } });
      if (!teamsOfOrg.length) {
        return ids.map(() => []);
      }
      const teamIds = teamsOfOrg.map((team) => team._id);
      const teamMemberships = await teamService.getMemberships({ teamId: { $in: teamIds }, userId });
      const membershipTeamIds = teamMemberships.map((membership) => membership.teamId.toHexString());
      const teamsOfUser = teamsOfOrg.filter((team) => membershipTeamIds.includes(team._id));
      const teamsOfUserMap = teamsOfUser.reduce((teamsMap: Record<string, ITeam[]>, team: ITeam) => {
        const key = `${userId}-${team.belongsTo.toHexString()}`;
        if (!teamsMap[key]) {
          teamsMap[key] = [team];
          return teamsMap;
        }
        teamsMap[key] = [...teamsMap[key], team];
        return teamsMap;
      }, {});
      return ids.map((id) => teamsOfUserMap[id] || []);
    });
  }
}
