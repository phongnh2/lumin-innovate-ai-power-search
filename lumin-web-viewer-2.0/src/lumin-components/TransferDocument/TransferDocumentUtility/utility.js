/* eslint-disable class-methods-use-this */
import { folderType } from 'constants/documentConstants';
import personalUtility from './PersonalUtility';
import organizationUtility from './OrganizationUtility';

class Utility {
  from = (source) => {
    switch (source) {
      case folderType.INDIVIDUAL:
        return personalUtility;
      case folderType.ORGANIZATION:
        return organizationUtility;
      default:
        break;
    }

    return null;
  };

  reset = () => {
    personalUtility.reset();
    organizationUtility.reset();
  };
}

export default new Utility();
