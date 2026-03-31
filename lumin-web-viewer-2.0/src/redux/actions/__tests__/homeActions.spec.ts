import * as homeActions from '../homeActions';

describe('homeActions', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  describe('setTeamSelectorData', () => {
    it('should dispatch SET_TEAM_SELECTOR_DATA', () => {
      const payload = {
        selectedTeam: { _id: 'team-123', name: 'Test Team' } as any,
        folderType: 'team',
      };
      homeActions.setTeamSelectorData(payload)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_TEAM_SELECTOR_DATA',
        payload,
      });
    });

    it('should dispatch with null selectedTeam', () => {
      const payload = {
        selectedTeam: null as any,
        folderType: 'personal',
      };
      homeActions.setTeamSelectorData(payload)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_TEAM_SELECTOR_DATA',
        payload,
      });
    });
  });
});

