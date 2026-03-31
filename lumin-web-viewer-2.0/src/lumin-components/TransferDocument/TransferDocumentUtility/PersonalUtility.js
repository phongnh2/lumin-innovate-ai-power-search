/* eslint-disable class-methods-use-this */
import { DOCUMENT_TYPE } from 'constants/documentConstants';
import {
  avatar as avatarUtils,
} from 'utils';
import BaseUtility from './BaseUtility';
import folderUtility from './FolderUtility';

class PersonalUtility extends BaseUtility {
  getInfoOf = (target) => ({
    ownedId: target.user._id,
  });

  getAllExpandedList = async ({ t, user }) => {
    const folderList = await this._getFolderExpandedList({ t, user });
    return [
      this._getUserExpandedList(user),
      folderList,
    ];
  };

  _getUserExpandedList = (user) => ({
    disabledSearch: true,
    sourceType: DOCUMENT_TYPE.PERSONAL,
    fixed: true,
    items: this.intercept(user),
  });

  intercept = (user) => ([{
    id: user._id,
    content: user.name,
    avatar: {
      src: avatarUtils.getAvatar(user.avatarRemoteId),
      variant: 'circular',
      defaultSrc: avatarUtils.getTextAvatar(user.name),
    },
    source: DOCUMENT_TYPE.PERSONAL,
  }]);

  _getFolderExpandedList = async ({ t, user }) => {
    if (!this.folders) {
      this.folders = await folderUtility.getAllPersonalFolder();
    }
    return {
      sourceType: DOCUMENT_TYPE.FOLDER,
      title: t('common.folders'),
      items: folderUtility.intercept(this.folders, { id: user._id, type: DOCUMENT_TYPE.PERSONAL }),
    };
  };

  reset() {
    this.folders = null;
  }
}

export default new PersonalUtility();
