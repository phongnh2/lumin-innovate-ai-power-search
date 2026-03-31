/* eslint-disable no-use-before-define */
import { Document, UpdateQuery } from 'mongoose';

import { RecursivePartial, WithRequired } from 'Common/common.enum';
import { AvatarFile } from 'Common/common.interface';

import {
  CreateOrganizationInput, OrganizationPurpose, DomainVisibilitySetting, InviteUsersSetting,
  OrganizationAvatarSuggestion,
} from 'graphql.schema';
import { OrganizationPasswordStrengthEnums, OrganizationRoleEnums, TemplateWorkspaceEnum } from 'Organization/organization.enum';
import { PaymentSchemaInterface, ReservePaymentSchemaInterface } from 'Payment/interfaces/payment.interface';
import { User } from 'User/interfaces/user.interface';

export interface IOrganizationSettings {
  googleSignIn: boolean;
  autoApprove: boolean;
  /**
   * @deprecated
  */
  passwordStrength: OrganizationPasswordStrengthEnums;
  templateWorkspace: TemplateWorkspaceEnum;
  domainVisibility: DomainVisibilitySetting;
  autoUpgrade: boolean;
  other: {
    guestInvite: string;
    hideMember: boolean;
  }
  inviteUsersSetting: InviteUsersSetting;
  samlSsoConfigurationId?: string;
  scimSsoClientId?: string;
}

export interface IUserPermissions {
  canUseMultipleMerge?: boolean;
}

export interface OrganizationMetadata {
  firstUserJoinedManually: boolean;
  firstMemberInviteCollaborator: boolean;
  hasProcessedIndexingDocuments: boolean;
  avatarSuggestion?: OrganizationAvatarSuggestion;
  promotions: string[];
  promotionsClaimed: string[];
  promotionsOffered: string[];
}

export interface OrganizationSso {
  createdBy: string;
  ssoOrganizationId: string;
  samlSsoConnectionId: string;
  scimSsoClientId?: string;
}

export interface IOrganizationModel {
  name: string;
  createdAt: Date;
  avatarRemoteId: string;
  ownerId: any;
  payment: PaymentSchemaInterface;
  metadata: OrganizationMetadata;
  reservePayment: ReservePaymentSchemaInterface,
  billingEmail: string;
  url: string;
  domain: string;
  associateDomains: string[];
  settings: IOrganizationSettings;
  convertFromTeam: boolean;
  // Deprecated
  creationType: string;
  unallowedAutoJoin: string[];
  deletedAt: Date;
  isMigratedFromTeam: boolean;
  reachUploadDocLimit: boolean;
  // Deprecated
  isDefault: boolean;
  docStackStartDate: Date;
  purpose: OrganizationPurpose;
  isLastActiveOrg?: boolean;
  userPermissions?: IUserPermissions;
  isRestrictedBillingActions?: boolean;
  premiumSeats?: string[];
  hashedIpAddress?: string[];
  isSignProSeat?: boolean;
  signDocStackStorage?: ISignDocStackStorage
  sso?: OrganizationSso;
}

export interface IOrganization extends IOrganizationModel {
  _id: string;
}
export interface IOrganizationRole {
  organization: IOrganization;
  currentUser: {
    userId: string;
    role: string;
  }
}

export interface IOrganizationInfo {
  members: User[];
  totalMember: number;
}

export interface ICreateOrganization {
  creator: User;
  input: CreateOrganizationInput;
  organizationAvatar: AvatarFile;
  disableEmail?: boolean,
}

export type IUpdateOrganization = UpdateQuery<Omit<IOrganization, keyof Document>>
  & RecursivePartial<Omit<IOrganization, keyof Document>>
  // eslint-disable-next-line no-use-before-define
  & {payment?: IUpdatePayment};

export type IUpdatePayment = WithRequired<UpdateQuery<PaymentSchemaInterface>, 'trialInfo'>

export type DocumentMigrationResult = {
  totalDocument: number;
  totalOrg: number;
  totalFolder: number;
}

export type CreateOrgOptions = {
  disableEmail?: boolean;
  disableHubspot?: boolean;
}

export interface IOrganizationWithRole {
  organization: IOrganization;
  role: OrganizationRoleEnums;
}

export interface IOrganizationProto {
  organization_id: string;
  name: string;
  created_at: number;
  avatar_remote_id: string;
  payment: {
    customer_remote_id: string;
    subscription_remote_id: string;
    plan_remote_id: string;
    type: string;
    period: string;
    status: string;
    quantity: number;
    currency: string;
    trial_info?: {
      highest_trial: string;
      end_trial: Date;
    };
    stripe_account_id?: string;
    is_sign_pro_seat?: boolean;
    is_enterprise?: boolean;
    has_subscription?: boolean;
  };
  billing_email: string;
  url: string;
  domain: string;
  associate_domains: string[];
  settings?: {
    google_sign_in: boolean;
    auto_approve: boolean;
    password_strength: string;
    template_workspace: string;
    domain_visibility: string;
    auto_upgrade: boolean;
    other: {
      guest_invite: string;
      hide_member: boolean;
    }
  };
  convert_from_team?: boolean;
  creation_type?: string;
  unallowed_auto_join?: string[];
  deleted_at?: number;
  is_migrated_from_team?: boolean;
  reach_upload_doc_limit?: boolean;
  is_default?: boolean;
  doc_stack_start_date?: Date;
  purpose?: string;
  premium_seats?: number;
}

export interface IOrganizationWithRoleProto extends IOrganizationProto {
  user_role?: string;
}

export interface IExtraTrialDaysOrganization {
  circleId: string;
  extendedTrialDays: number;
  additionalInfo?: {
    inviterId?: string;
    invitedEmails?: string[];
    invitationIds?: string[];
  }
}
export interface ISignDocStackStorage {
  totalStack: number;
  totalUsed: number;
  templateLimit: number;
  isOverDocStack: boolean;
}

export interface UpdateContractStackMessage {
  orgId: string;
  signDocStackStorage: ISignDocStackStorage;
}
