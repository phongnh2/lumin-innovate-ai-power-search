import * as userActions from '../userActions';

describe('userActions', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  describe('updateUserMetadata', () => {
    it('should dispatch UPDATE_USER_METADATA', () => {
      const payload = { ratedApp: true };
      userActions.updateUserMetadata(payload)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_USER_METADATA',
        payload,
      });
    });

    it('should dispatch with multiple metadata properties', () => {
      const payload = { 
        ratedApp: true, 
        onboardingCompleted: true,
        preferredLanguage: 'en',
      };
      userActions.updateUserMetadata(payload)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_USER_METADATA',
        payload,
      });
    });

    it('should dispatch with empty payload', () => {
      userActions.updateUserMetadata({})(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_USER_METADATA',
        payload: {},
      });
    });
  });
});

