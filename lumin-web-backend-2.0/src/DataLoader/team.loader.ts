import * as DataLoader from 'dataloader';

import { Utils } from 'Common/utils/Utils';

import { ITeam } from 'Team/interfaces/team.interface';
import { TeamService } from 'Team/team.service';

export class TeamLoader {
  public static create(teamService: TeamService): DataLoader<string, ITeam> {
    return new DataLoader<string, ITeam>(async (ids: string[]) => {
      const teams = await teamService.find({ _id: { $in: ids } }, { _id: 1, name: 1 });
      const teamsMap = Utils.createKeyedMap(teams, (team) => team._id);
      return ids.map((id) => teamsMap[id]);
    });
  }
}
