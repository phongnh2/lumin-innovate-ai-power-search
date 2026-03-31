export interface WorkspaceInfo {
  _id: string;
  avatarRemoteId: string;
  name: string;
  plan: string;
  settingPageUrl?: string;
  inviteUsersSetting?: string;
  userRole?: string;
}

export interface WorkspaceSwitcherProps {
  onToggleSwitcher: () => void;
  onToggleInviteMembers: () => void;
  onCloseDrawer: () => void;
}
