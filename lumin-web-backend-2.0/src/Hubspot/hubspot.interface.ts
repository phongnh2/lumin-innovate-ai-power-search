// Association label names for Workspace <-> Contact
export enum WorkspaceContactAssociationLabel {
  OWNER = 'owner',
  ADMIN = 'admin',
}

// Custom event names for Workspace
export enum HubspotWorkspaceEventName {
  WORKSPACE_SUBSCRIPTION_CHANGED = 'workspace_subscription_changed',
  WORKSPACE_SIZE_CHANGED = 'workspace_size_changed',
}

// Status values for workspace_subscription_changed event
export enum WorkspaceSubscriptionChangedStatus {
  RENEWAL_FAILED = 'renewal_failed',
  SET_TO_CANCEL = 'set_to_cancel',
}

// Invited role values for workspace_size_changed event
export enum WorkspaceSizeChangedInvitedRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}
