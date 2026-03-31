import * as pageSearchActions from '../pageSearchActions';

describe('pageSearchActions', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  describe('setFocusingPageSearch', () => {
    it('should dispatch SET_FOCUSING_PAGE_SEARCH with true', () => {
      pageSearchActions.setFocusingPageSearch(true)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_FOCUSING_PAGE_SEARCH',
        payload: true,
      });
    });

    it('should dispatch SET_FOCUSING_PAGE_SEARCH with false', () => {
      pageSearchActions.setFocusingPageSearch(false)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_FOCUSING_PAGE_SEARCH',
        payload: false,
      });
    });
  });

  describe('setSearchKeyPageSearch', () => {
    it('should dispatch SET_SEARCH_KEY_PAGE_SEARCH', () => {
      pageSearchActions.setSearchKeyPageSearch('test query')(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SEARCH_KEY_PAGE_SEARCH',
        payload: 'test query',
      });
    });

    it('should dispatch with empty string', () => {
      pageSearchActions.setSearchKeyPageSearch('')(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SEARCH_KEY_PAGE_SEARCH',
        payload: '',
      });
    });
  });

  describe('findDocumentByName', () => {
    it('should dispatch FIND_DOCUMENT_BY_NAME', () => {
      pageSearchActions.findDocumentByName('document.pdf')(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FIND_DOCUMENT_BY_NAME',
        payload: 'document.pdf',
      });
    });

    it('should dispatch with partial name', () => {
      pageSearchActions.findDocumentByName('report')(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FIND_DOCUMENT_BY_NAME',
        payload: 'report',
      });
    });
  });
});

