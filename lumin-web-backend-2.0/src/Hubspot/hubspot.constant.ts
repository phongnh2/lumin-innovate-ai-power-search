import { OrganizationRoleEnums } from 'Organization/organization.enum';

import {
  WorkspaceContactAssociationLabel,
  WorkspaceSizeChangedInvitedRole,
} from './hubspot.interface';

// HubSpot standard object type IDs
// Reference: https://developers.hubspot.com/docs/guides/crm/understanding-the-crm#object-type-id-values
export const HUBSPOT_OBJECT_TYPE_IDS = {
  CONTACT: '0-1',
  COMPANY: '0-2',
  DEAL: '0-3',
} as const;

// Mapping from OrganizationRoleEnums to WorkspaceContactAssociationLabel
export const ORG_ROLE_TO_ASSOCIATION_LABEL: Record<
  OrganizationRoleEnums,
  WorkspaceContactAssociationLabel | undefined
> = {
  [OrganizationRoleEnums.ORGANIZATION_ADMIN]: WorkspaceContactAssociationLabel.OWNER,
  [OrganizationRoleEnums.BILLING_MODERATOR]: WorkspaceContactAssociationLabel.ADMIN,
  [OrganizationRoleEnums.MEMBER]: undefined,
};

// HubSpot contact search batch size limit
export const HUBSPOT_CONTACT_SEARCH_BATCH_SIZE = 100;

// HubSpot API concurrency limits to avoid rate limiting
// HubSpot allows ~100 requests per 10 seconds, we use conservative limits
export const HUBSPOT_API_CONCURRENCY_LIMIT = 10;

// HubSpot batch API limit per request
export const HUBSPOT_BATCH_SIZE_LIMIT = 100;

// Rate limit retry configuration
export const HUBSPOT_RATE_LIMIT_MAX_RETRIES = 5;
export const HUBSPOT_RATE_LIMIT_INITIAL_DELAY_MS = 1000; // 1 second
export const HUBSPOT_RATE_LIMIT_MAX_DELAY_MS = 10000; // 10 seconds
export const HUBSPOT_BATCH_DELAY_MS = 100; // Delay between batch chunks to spread requests

export const HUBSPOT_WORKSPACE_SYNC_MEMBERS_LIMIT = 5000;

// Mapping from OrganizationRoleEnums to WorkspaceSizeChangedInvitedRole
export const ORG_ROLE_TO_INVITED_ROLE: Record<
  OrganizationRoleEnums,
  WorkspaceSizeChangedInvitedRole
> = {
  [OrganizationRoleEnums.ORGANIZATION_ADMIN]: WorkspaceSizeChangedInvitedRole.ADMIN,
  [OrganizationRoleEnums.BILLING_MODERATOR]: WorkspaceSizeChangedInvitedRole.ADMIN,
  [OrganizationRoleEnums.MEMBER]: WorkspaceSizeChangedInvitedRole.MEMBER,
};
