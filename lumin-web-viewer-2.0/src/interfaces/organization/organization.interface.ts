import { InviteUsersSetting } from 'constants/organization.enum';
import { PaymentPeriod, PaymentPlans, PaymentStatus } from 'constants/plan.enum';

import { IChargeData, IOrganizationPayment } from 'interfaces/payment/payment.interface';
import { ITeam } from 'interfaces/team/team.interface';
import { IMember, IUser } from 'interfaces/user/user.interface';

export enum OrganizationPasswordStrengthEnums {
  SIMPLE = 'SIMPLE',
  STRONG = 'STRONG',
}

export enum TemplateWorkspaceEnum {
  PERSONAL = 'PERSONAL',
  ORGANIZATION = 'ORGANIZATION',
  ORGANIZATION_TEAM = 'ORGANIZATION_TEAM',
}

export enum DomainVisibilitySetting {
  INVITE_ONLY = 'INVITE_ONLY',
  VISIBLE_AUTO_APPROVE = 'VISIBLE_AUTO_APPROVE',
  VISIBLE_NEED_APPROVE = 'VISIBLE_NEED_APPROVE',
}

export enum OrganizationPupose {
  PERSONAL = 'PERSONAL',
  WORK = 'WORK',
  EDUCATION = 'EDUCATION',
}

export enum JoinOrganizationStatus {
  CAN_JOIN = 'CAN_JOIN',
  CAN_REQUEST = 'CAN_REQUEST',
  PENDING_INVITE = 'PENDING_INVITE',
  REQUESTED = 'REQUESTED',
  JOINED = 'JOINED',
}

export enum UpdateSignWsPaymentActions {
  ASSIGN_SEAT = 'ASSIGN_SEAT',
  UNASSIGN_SEAT = 'UNASSIGN_SEAT',
}

export interface IOrganizationSettings {
  googleSignIn: boolean;
  autoApprove: boolean;
  passwordStrength: OrganizationPasswordStrengthEnums;
  templateWorkspace: TemplateWorkspaceEnum;
  domainVisibility: DomainVisibilitySetting;
  inviteUsersSetting: string;
  autoUpgrade: boolean;
  other: {
    guestInvite: string;
    hideMember: boolean;
  };
}

export interface IUserPermissions {
  canUseMultipleMerge?: boolean;
}

export interface ISignDocStackStorage {
  isOverDocStack: boolean;
  totalUsed: number;
  totalStack: number;
}

export interface IOrganizationSso {
  createdBy: string;
  ssoOrganizationId: string;
  samlSsoConnectionId: string;
  scimSsoClientId?: string;
}

export interface IOrganization {
  _id: string;
  name: string;
  createdAt: Date;
  avatarRemoteId: string;
  ownerId: string;
  payment: IOrganizationPayment;
  billingEmail: string;
  url: string;
  domain: string;
  associateDomains: string[];
  settings: IOrganizationSettings;
  convertFromTeam: boolean;
  creationType: string;
  unallowedAutoJoin: string[];
  deletedAt: Date;
  isMigratedFromTeam: boolean;
  reachUploadDocLimit: boolean;
  userRole: string;
  docStackStorage: {
    totalUsed: number;
    totalStack: number;
  };
  disableNearlyHitDocStack: boolean;
  hasPendingInvoice: boolean;
  teams: ITeam[];
  members: IMember[];
  totalMember?: number;
  totalActiveMember?: number;
  isLastActiveOrg?: boolean;
  documentsAvailable?: boolean;
  totalTeam?: number;
  inviteUsersSetting?: InviteUsersSetting;
  userPermissions?: IUserPermissions;
  isRestrictedBillingActions?: boolean;
  aiChatbotDailyLimit?: number;
  totalSignSeats?: number;
  availableSignSeats?: number;
  isSignProSeat: boolean;
  signDocStackStorage?: ISignDocStackStorage;
  metadata?: {
    avatarSuggestion?: IOrganizationAvatarSuggestion;
  };
  sso?: IOrganizationSso;
}

export type InviteToOrganizationInput = {
  _id: string;
  email: string;
  role: string;
};

export type OrganizationMemberInvitation = {
  memberEmail: string;
  invitationId: string;
};

type IOrganizationAvatarSuggestion = {
  suggestionAvatarRemoteId?: string;
};

export type SuggestedPremiumOrganization = {
  _id: string;
  name: string;
  url: string;
  avatarRemoteId: string;
  domainVisibility: DomainVisibilitySetting;
  joinStatus: JoinOrganizationStatus;
  members?: IMember[];
  totalMember: number;
  paymentType?: PaymentPlans;
  paymentPeriod?: PaymentPeriod;
  paymentStatus?: PaymentStatus;
  owner?: IUser;
  createdAt?: Date;
};

export interface SuggestedOrganization {
  _id: string;
  name: string;
  avatarRemoteId: string;
  status: JoinOrganizationStatus;
  totalMember?: number;
  owner?: IUser;
  createdAt?: Date;
  members?: IMember[];
  payment?: IChargeData;
  hashedIpAddresses?: string[];
}

export type PremiumModalContentType = {
  title: string;
  message: string;
  startTrialButton?: {
    label: string;
    link: string;
  };
  upgradeButton: {
    label: string;
    link: string;
  };
};

export interface SamlSsoConfiguration {
  id: string;
  createdAt: string;
  domains: string[];
  label: string;
  ascUrl: string;
  spEntityId: string;
  rawIdpMetadataXml: string;
}

export interface ScimSsoConfiguration {
  id: string;
  label: string;
  authorizationHeaderSecret: string;
  mapperUrl: string;
  scimServerUrl: string;
}
