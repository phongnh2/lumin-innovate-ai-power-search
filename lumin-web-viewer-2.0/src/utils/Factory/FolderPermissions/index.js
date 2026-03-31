import { FolderPermission, FolderRole, FolderType } from 'constants/folderConstant';
import selectors from 'selectors';
import { store } from 'src/redux/store';
import { OrganizationUtilities } from 'utils/Factory/Organization';
import { TeamUtilities } from 'utils/Factory/Team';

const highestPermission = [
  FolderPermission.CREATE,
  FolderPermission.EDIT,
  FolderPermission.DELETE,
  FolderPermission.UPLOAD_DOCUMENT,
  FolderPermission.REMOVE_DOCUMENT,
];

const Rules = {
  [FolderRole.MANAGER]: highestPermission,
  [FolderRole.OWNER]: highestPermission,
  [FolderRole.MEMBER]: [FolderPermission.UPLOAD_DOCUMENT],
  [FolderRole.SHARED]: [], // implement later
};

export class FolderPermissions {
  constructor({ type, folder, team }) {
    this.getState = store.getState;
    this.dispatch = store.dispatch;
    this.folder = folder;
    this.type = type;
    this.team = team;
    this.organizationUtilities = new OrganizationUtilities({ organization: this.getOrganization() });
    this.teamUtilities = new TeamUtilities({ team });
  }

  getUser() {
    return selectors.getCurrentUser(this.getState()) || {};
  }

  getOrganization() {
    return selectors.getCurrentOrganization(this.getState()).data || {};
  }

  getPermissions() {
    return Rules[this.getRole()];
  }

  hasPermission(action) {
    return this.getPermissions().includes(action);
  }

  isFolderOwner() {
    return !this.folder || this.folder.ownerId === this.getUser()._id;
  }

  getRole() {
    switch (this.type) {
      case FolderType.PERSONAL:
        return this.isFolderOwner() ? FolderRole.OWNER : FolderRole.SHARED;
      case FolderType.ORGANIZATION:
        return this.organizationUtilities.isManager() ? FolderRole.MANAGER : FolderRole.MEMBER;
      case FolderType.ORGANIZATION_TEAM:
        return this.teamUtilities.isManager() ? FolderRole.MANAGER : FolderRole.MEMBER;
      default:
        throw new Error('Type is invalid.');
    }
  }
}
