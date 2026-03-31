import { Dispatch } from 'redux';

import { ITeam } from 'interfaces/team/team.interface';

export const setTeamSelectorData = (payload: { selectedTeam: ITeam; folderType: string }) => (dispatch: Dispatch) => {
  dispatch({
    type: 'SET_TEAM_SELECTOR_DATA',
    payload,
  });
};
