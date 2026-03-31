import produce from 'immer';
import { findIndex } from 'lodash';

import selectors from 'selectors';

export const setFolderList = (folderList) => (dispatch) => {
  dispatch({
    type: 'SET_FOLDER_LIST',
    payload: {
      data: folderList,
    },
  });
};

export const startFetchFolderList = () => (dispatch) => {
  dispatch({
    type: 'FETCH_FOLDER_LIST',
  });
};

export const fetchFolderListFailed = (error) => (dispatch) => {
  dispatch({
    type: 'FETCH_FOLDER_LIST_FAILED',
    payload: {
      error,
    },
  });
};

export const resetFolderList = () => (dispatch) => {
  dispatch({
    type: 'RESET_FOLDER_LIST',
  });
};

export const updateFolderInList = ({ newFolder, isStarTab }) => (dispatch, getState) => {
  const { data: currentFolderList } = selectors.getFolderList(getState());
  const newList = produce(currentFolderList, (draftFolders) => {
    const currentIndex = findIndex(currentFolderList, ['_id', newFolder._id]);
    if (isStarTab) {
      draftFolders.splice(currentIndex, 1);
    } else {
      Object.assign(draftFolders[currentIndex], newFolder);
    }
  });
  dispatch(setFolderList(newList));
};

export const setCurrentFolder = (payload) => (dispatch) => {
  dispatch({
    type: 'SET_CURRENT_FOLDER',
    payload,
  });
};
