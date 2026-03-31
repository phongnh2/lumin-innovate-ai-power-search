/* eslint-disable class-methods-use-this */
import { FolderServices } from 'services';
import { FolderType } from 'constants/folderConstant';
import { DOCUMENT_TYPE } from 'constants/documentConstants';

class FolderUtility {
  getAllPersonalFolder = () => {
    const folderServices = new FolderServices(FolderType.PERSONAL);
    return folderServices.getAll({ isStarredTab: false });
  };

  intercept = (folderData, belongsTo) => folderData.map((folder) => ({
    id: folder._id,
    content: folder.name,
    belongsTo,
    avatar: {
      type: 'folder',
      name: folder.name,
      color: folder.color,
    },
    source: DOCUMENT_TYPE.FOLDER,
  }));
}

export default new FolderUtility();
