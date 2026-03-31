import { FOLDER_SORT_DIRECTION, FOLDER_SORT_OPTIONS } from 'constants/folderConstant';
import string from './string';

export default class FolderUtils {
  static ShortenNameLength = 30;

  static shorten(folderName = '') {
    return string.getShortStringWithLimit(folderName, FolderUtils.ShortenNameLength);
  }

  static sortFolderList = (folderList, sortOption) => {
    const { sortKey, sortDirection } = sortOption;
    const sortDirectionValueMapping = {
      [FOLDER_SORT_DIRECTION.ASC]: 1,
      [FOLDER_SORT_DIRECTION.DESC]: -1,
    };

    let sortCondition = () => {};
    switch (sortKey) {
      case FOLDER_SORT_OPTIONS.DATE_CREATED.key:
        sortCondition = (firstFolder, secondFolder) => {
          const firstFolderCreatedDate = new Date(firstFolder[sortKey]).getTime();
          const secondFolderCreatedDate = new Date(secondFolder[sortKey]).getTime();
          return (firstFolderCreatedDate - secondFolderCreatedDate) * sortDirectionValueMapping[sortDirection];
        };
        break;

      case FOLDER_SORT_OPTIONS.NAME.key:
        sortCondition = (firstFolder, secondFolder) => {
          const firstFolderName = firstFolder[sortKey];
          const secondFolderName = secondFolder[sortKey];
          return firstFolderName.localeCompare(secondFolderName) * sortDirectionValueMapping[sortDirection];
        };
        break;

      default:
        break;
    }

    return folderList.slice().sort(sortCondition);
  }
}
