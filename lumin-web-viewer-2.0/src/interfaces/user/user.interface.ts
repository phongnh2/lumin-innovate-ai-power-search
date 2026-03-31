import { FileService, InviteScope } from 'constants/domainRules.enum';

import { IUserPayment } from 'interfaces/payment/payment.interface';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  payment: IUserPayment;
  avatarRemoteId: string;
  lastAccessedOrgUrl: string;
  isPopularDomain?: boolean;
  setting: {
    defaultWorkspace: string;
  };
  metadata: {
    hasInformedMyDocumentUpload: boolean;
    docSummarizationConsentGranted: boolean;
    formFieldDetectionConsentGranted: boolean;
    introduceNewLayout: boolean;
    isHiddenSuggestedOrganization: boolean;
    isUsingNewLayout?: boolean;
    introduceNewInAppLayout?: boolean;
    exploredFeatures?: {
      editPdf: number;
      formBuilder: number;
      ocr: number;
      splitPdf: number;
      summarization: number;
      redactPdf: number;
      protectPdf: number;
    };
    hasShownEditInAgreementGenModal: boolean;
    hasClosedQuickSearchGuideline: boolean;
    acceptedTermsOfUseVersion: string;
    isFirstTimeRedactFromFLP: boolean;
    isFirstTimeSetPasswordFromFLP: boolean;
  };
  clientId: string;
  lastLogin: Date;
  hasJoinedOrg?: boolean;
  migratedOrgUrl?: string;
  deletedAt: Date;
  createdAt: Date;
  loginService: string;
  signatures: string[];
  userRole?: string;
  isOneDriveAddInsWhitelisted: boolean;
  isOneDriveFilePickerWhitelisted: boolean;
  toolQuota?: {
    formFieldDetection?: {
      usage: number;
      blockTime: number;
      isExceeded: boolean;
    };
    autoDetection?: {
      usage: number;
      blockTime: number;
      isExceeded: boolean;
    };
  };
  isTermsOfUseVersionChanged?: boolean;
  allTenantConfigurations?: {
    domain: string;
    configuration: {
      files?: {
        service?: FileService;
        templateManagementEnabled?: boolean;
      };
      organization?: {
        allowOrgCreation?: boolean;
      };
      collaboration?: {
        inviteScope?: InviteScope;
      };
      ui?: {
        hideAiChatbot?: boolean;
        hidePromptDriveUsersBanner?: boolean;
      };
    };
  }[];
  hashedIpAddress?: string;
  // FIXME: we will finish this type later
}

export interface IMember {
  _id: string;
  name: string;
  avatarRemoteId: string;
}

export type UserInvitationStatus =
  | 'invitation_expired'
  | 'invitation_valid'
  | 'invitation_invalid'
  | 'invitation_removed';

export type UserInvitationType = 'circle_invitation' | 'share_document';

export type VerifyInvitationTokenPayload = {
  type: UserInvitationType;
  email: string;
  status: UserInvitationStatus;
  newAuthProcessing: boolean;
  metadata: { orgId?: string; documentId?: string; orgUrl?: string; orgName?: string; invitationId?: string };
};

export interface IUserResult {
  _id: string;
  name: string;
  email: string;
  avatarRemoteId: string;
  status: string;
  grantedPermission: boolean;
  disabled?: boolean;
}

export type FindUserInput = {
  searchKey?: string;
  targetType: string;
  targetId?: string;
  excludeUserIds?: string[];
};
