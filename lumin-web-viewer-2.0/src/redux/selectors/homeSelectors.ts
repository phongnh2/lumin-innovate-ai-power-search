/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { RootState } from 'store';

import { ITeam } from 'interfaces/team/team.interface';

type TeamSelectorDataType = { selectedTeam: ITeam | null; folderType: string };

export const getTeamSelectorData = (state: RootState): TeamSelectorDataType =>
  state.home.teamSelectorData as TeamSelectorDataType;
