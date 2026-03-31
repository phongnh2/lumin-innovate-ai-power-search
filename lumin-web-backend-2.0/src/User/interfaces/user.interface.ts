/* eslint-disable no-use-before-define */
import { Setting } from 'Common/common.interface';
import { Platforms } from 'Common/constants/Platform';

import { CountryCode } from 'Auth/countryCode.enum';
import {
  AuthenType, LoginService, UserRating,
} from 'graphql.schema';
import { OrganizationRoleEnums } from 'Organization/organization.enum';
import { PaymentSchemaInterface } from 'Payment/interfaces/payment.interface';
import { OrganizationPlans, PaymentPlanEnums } from 'Payment/payment.enum';

export interface INewNotifications {
  general: boolean | Date,
  invites: boolean | Date,
  requests: boolean | Date,
}

export interface Signature {
  remoteId?: string;
  presignedUrl?: string;
}

export interface IDeleteSignature {
  userInfo: User,
  removedIndex: number,
}

export interface UserModel {
  identityId: string;
  email: string;
  /**
   * @deprecated We no longer store user password
 */
  password: string;
  name: string;
  createdAt: Date;
  payment: PaymentSchemaInterface;
  setting: Setting;
  isNotify: boolean;
  lastLogin: Date;
  roles: string[];
  isVerified: boolean;
  avatarRemoteId: string;
  timezoneOffset: number;
  deletedAt: Date;
  signatures: string[];
  /**
   * @deprecated We no longer store user password
 */
  recentPasswords: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  endTrial: Date;
  type: string;
  metadata: UserMetaData;
  lastAccess: Date;
  loginService: LoginService;
  origin?: string,
  version?: string;
  newNotifications: INewNotifications;
  emailDomain: string;
  googleRefreshToken?: string;
  migratedOrgUrl?: string;
  countryCode?: string;
  previousLoginService?: LoginService;
}

export interface User extends UserModel {
  _id: string
}
export interface UserMetaData {
  hasShownBananaBanner: boolean;
  rating: UserRating;
  folderColors: string[];
  numberCreatedOrg: number;
  isMigratedPersonalDoc: boolean;
  hasInformedMyDocumentUpload: boolean;
  ratedApp: boolean;
  hasShownEditFileOfflinePopover: boolean;
  hasShownContentEditPopover: boolean;
  hasShownAutoSyncDefault: boolean;
  highestOrgPlan: IHighestOrgPlan;
  isSyncedMarketingEmailSetting: boolean;
  beRemovedFromDeletedOrg: boolean;
  docSummarizationConsentGranted: boolean;
  isHiddenSuggestedOrganization: boolean;
  openGoogleReferrer: string[];
  formFieldDetectionConsentGranted: boolean;
  exploredFeatures: {
    editPdf: number;
    formBuilder: number;
    ocr: number;
    splitPdf: number;
    summarization: number;
    protectPdf: number;
    redactPdf: number;
  };
  isUsingNewInAppLayout: boolean;
  hasShowOnboardingFlowFromOpenGoogle: boolean;
  isAgreementTourGuideVisible: boolean;
  chatbotFreeRequests: number;
  hasShownEditInAgreementGenModal: boolean;
  hasShownSharePrompt: boolean;
  hasSyncedEmailToBraze: boolean;
  hasClosedQuickSearchGuideline: boolean;
  hasSyncedOidcAvatar: boolean;
  hasProcessedIndexingDocuments: boolean;
  processedIndexingRecentDocuments: string[];
  acceptedTermsOfUseVersion: string;
}

export interface IHighestOrgPlan {
  highestLuminPlan: PaymentPlanEnums;
  highestLuminPlanStatus: string;
  highestLuminOrgRole: string;
}

export interface TokenPayloadInterface {
  _id: any;
  email: string;
  loginType?: string;
}

export interface IUpdateUserEmailsCommand {
  conditions: {
    emails: string[];
  },
  updatedObj: {
    newEmails: string[];
  }
}

export type UpdateUserDataAfterSignUpInput = {
  userId: string;
  email: string;
  userName?: string;
  authenType: AuthenType;
  createdAt?: Date;
  loginService?: LoginService;
  platform?: Platforms;
  userAgent?: string;
  anonymousUserId?: string;
}

export type UserWithError = {
  user?: User;
  error: unknown;
}

export interface GetUserPaymentInfoPayload {
  hasUpgradedToPremiumPlan: boolean,
  hasTrialPlan: boolean,
}

export interface ILastAccessOrganization {
  _id: string;
  role: OrganizationRoleEnums;
  payment: {
    plan: OrganizationPlans,
    hasUpgradedToPremium: boolean;
  };
}

export interface IGetStaticToolUploadWorkspacePayload {
  isPremiumUser: boolean;
  lastAccessOrganization?: ILastAccessOrganization;
}

export interface IUserLocation {
  city: string;
  regionName: string;
  countryCode: string;
}

export interface ITrackAccountCreatedEventPayload {
  userId: string;
  email: string;
  createdAt: Date;
  loginService: LoginService;
  platform?: Platforms;
  userAgent?: string;
  anonymousUserId?: string;
}

export interface ChangeUserLoginServiceResult {
  userId: string;
  identityDeleted: boolean;
  userUpdated: boolean;
}

export interface OidcAvatarData {
  content: Buffer;
  mimeType: string
}

export interface IUser extends UserModel {
  _id: string;
}

export type UserWithExtraInfo = User & {
  isAdmin?: boolean;
  loginType?: string;
  lastAccessedOrgUrl?: string;
  isTermsOfUseVersionChanged?: boolean;
  isPopularDomain?: boolean;
}

export interface IUserContext extends IUser {
  countryCode?: CountryCode;
  geoLocation?: {
    countryCode: CountryCode;
    city: string;
    region: string;
  };
}
