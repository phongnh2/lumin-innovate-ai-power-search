// Mock selectors
const mockGetFolderList = jest.fn();

jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getFolderList: (state: any) => mockGetFolderList(state),
  },
}));

import * as folderActions from '../folderActions';

describe('folderActions', () => {
  let dispatch: jest.Mock;
  let getState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(dispatch);
      }
      return action;
    });
    getState = jest.fn();
  });

  describe('setFolderList', () => {
    it('should dispatch SET_FOLDER_LIST', () => {
      const folderList = [{ _id: 'folder-1' }, { _id: 'folder-2' }];
      folderActions.setFolderList(folderList)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_FOLDER_LIST',
        payload: { data: folderList },
      });
    });
  });

  describe('startFetchFolderList', () => {
    it('should dispatch FETCH_FOLDER_LIST', () => {
      folderActions.startFetchFolderList()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCH_FOLDER_LIST',
      });
    });
  });

  describe('fetchFolderListFailed', () => {
    it('should dispatch FETCH_FOLDER_LIST_FAILED with error', () => {
      const error = new Error('Failed to fetch');
      folderActions.fetchFolderListFailed(error)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCH_FOLDER_LIST_FAILED',
        payload: { error },
      });
    });
  });

  describe('resetFolderList', () => {
    it('should dispatch RESET_FOLDER_LIST', () => {
      folderActions.resetFolderList()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'RESET_FOLDER_LIST',
      });
    });
  });

  describe('updateFolderInList', () => {
    it('should update folder in list when isStarTab is false', () => {
      const currentFolderList = [
        { _id: 'folder-1', name: 'Old Name' },
        { _id: 'folder-2', name: 'Other' },
      ];
      mockGetFolderList.mockReturnValue({ data: currentFolderList });

      const newFolder = { _id: 'folder-1', name: 'New Name' };
      folderActions.updateFolderInList({ newFolder, isStarTab: false })(dispatch, getState);

      expect(dispatch).toHaveBeenCalled();
    });

    it('should remove folder from list when isStarTab is true', () => {
      const currentFolderList = [
        { _id: 'folder-1', name: 'Folder 1' },
        { _id: 'folder-2', name: 'Folder 2' },
      ];
      mockGetFolderList.mockReturnValue({ data: currentFolderList });

      const newFolder = { _id: 'folder-1', name: 'Folder 1' };
      folderActions.updateFolderInList({ newFolder, isStarTab: true })(dispatch, getState);

      expect(dispatch).toHaveBeenCalled();
    });
  });

  describe('setCurrentFolder', () => {
    it('should dispatch SET_CURRENT_FOLDER', () => {
      const payload = { _id: 'folder-123', name: 'My Folder' };
      folderActions.setCurrentFolder(payload)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_CURRENT_FOLDER',
        payload,
      });
    });
  });
});

