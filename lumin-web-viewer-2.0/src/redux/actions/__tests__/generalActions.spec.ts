import * as generalActions from '../generalActions';

describe('generalActions', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  describe('setDocumentTabType', () => {
    it('should dispatch SET_DOCUMENT_TAB_TYPE', () => {
      const payload = { type: 'personal' };
      generalActions.setDocumentTabType(payload)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_DOCUMENT_TAB_TYPE',
        payload,
      });
    });

    it('should dispatch with different tab types', () => {
      const payload = { type: 'shared' };
      generalActions.setDocumentTabType(payload)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_DOCUMENT_TAB_TYPE',
        payload,
      });
    });
  });
});

