/* eslint-disable class-methods-use-this */
import produce from 'immer';

import { setCurrentUser } from 'actions/authActions';

import selectors from 'selectors';

import { FolderType } from 'constants/folderConstant';

import { OrganizationFolder } from './organization';
import { OrganizationTeamFolder } from './organizationTeam';
import { PersonalFolder } from './personal';
import { store } from '../../redux/store';
import * as folderApi from '../graphServices/folder';

const { dispatch, getState } = store;
class FolderServices {
  constructor(type) {
    switch (type) {
      case FolderType.PERSONAL:
        this.instance = new PersonalFolder();
        break;
      case FolderType.ORGANIZATION:
        this.instance = new OrganizationFolder();
        break;
      case FolderType.ORGANIZATION_TEAM:
        this.instance = new OrganizationTeamFolder();
        break;
      default:
        this.instance = new PersonalFolder();
        break;
    }
  }

  create(params) {
    return this.instance.create(params);
  }

  getTotal(params) {
    return this.instance.getTotal(params);
  }

  getAll(params) {
    return this.instance.getAll(params);
  }

  edit({ folderId, color, name }) {
    return folderApi.editFolderInfo({
      folderId,
      updateProperties: { color, name },
    });
  }

  starFolder(folderId) {
    return folderApi.starFolder(folderId);
  }

  async addColor(color) {
    const currentUser = selectors.getCurrentUser(getState());
    const isColorExisted = currentUser.metadata.folderColors.includes(color);
    if (isColorExisted) {
      return;
    }
    const newColors = await folderApi.addColor(color);
    const updatedUser = produce(currentUser, (draftState) => {
      draftState.metadata.folderColors = newColors;
    });
    dispatch(setCurrentUser(updatedUser));
  }

  delete(folderId, isNotify) {
    return folderApi.deleteFolder(folderId, isNotify);
  }

  getDetail(folderId) {
    return folderApi.getFolderDetail(folderId);
  }

  getLocation(params) {
    return this.instance.getLocation(params);
  }

  deleteMultipleFolder(params) {
    return folderApi.deleteMultipleFolder(params);
  }
}

export default FolderServices;
