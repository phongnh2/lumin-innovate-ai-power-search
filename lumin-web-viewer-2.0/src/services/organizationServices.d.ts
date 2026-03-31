import { UploadParams, UploadOptions } from 'services/types/personalDocumentUploadService.type';

import { NestedPlainData } from 'features/NestedFolders/types';

import { InviteUsersSetting } from 'constants/organization.enum';
import { PaymentCurrency, PaymentPeriod, PaymentPlans } from 'constants/plan.enum';

import { IBasicResponse } from 'interfaces/common';
import { DocumentImportParams, IDocumentBase } from 'interfaces/document/document.interface';
import {
  IOrganization,
  OrganizationPupose,
  InviteToOrganizationInput,
  OrganizationMemberInvitation,
  SuggestedPremiumOrganization,
  SamlSsoConfiguration,
  ScimSsoConfiguration,
} from 'interfaces/organization/organization.interface';
import { IChargeData, IOrganizationPayment, PaymentSubScriptionItem } from 'interfaces/payment/payment.interface';
import { IUser } from 'interfaces/user/user.interface';

interface IUpgradeSubscriptionInput {
  plan: string;
  period: PaymentPeriod;
  quantity: number;
  sourceId?: string;
  couponCode?: string;
}

export interface ICreateOrganizationSubscriptionInput {
  tokenId?: string;
  plan: PaymentPlans.ORG_STARTER | PaymentPlans.ORG_PRO | PaymentPlans.ORG_BUSINESS;
  period: PaymentPeriod;
  currency: PaymentCurrency;
  quantity: number;
  couponCode?: string;
  isBlockedPrepaidCardOnTrial?: boolean;
}

declare namespace organizationServices {
  export function createOrganization({
    file,
    organizationData,
  }: {
    file?: unknown;
    organizationData: {
      name: string;
      purpose: OrganizationPupose;
    };
  }): Promise<{ organization: IOrganization }>;

  export function reactivateSubscription(orgId: string): Promise<{ data: IOrganizationPayment }>;

  export function reactivateUnifyOrganizationSubscription({
    orgId,
    productsToReactivate,
  }: {
    orgId: string;
    productsToReactivate: Pick<PaymentSubScriptionItem, 'productName'>[];
  }): Promise<{ data: IOrganizationPayment }>;

  export function changeAutoUpgradeSetting(orgId: string, enabled: boolean): Promise<IOrganization['settings']>;

  export function reactiveOrganization(orgId: string): Promise<{ organization: IOrganization }>;

  export function isManager(userRole: string): boolean;

  export function uploadThirdPartyDocuments({
    orgId,
    folderId,
    documents,
  }: {
    orgId: string;
    folderId: string;
    documents: DocumentImportParams[];
  }): Promise<IDocumentBase[]>;

  export function uploadDocumentToPersonal(params: UploadParams, optionPrams: UploadOptions): Promise<IDocumentBase>;

  export function upgradeOrganizationSubcription(orgId: string, input: IUpgradeSubscriptionInput): Promise<IChargeData>;

  export function changedDocumentStackSubscription(params: {
    orgId: string;
    onNext: (data: any) => void;
    onError: (e: Error) => void;
  }): unknown;

  export function hideInformMyDocumentModal(orgId: string): Promise<IBasicResponse>;

  export function inviteMemberToOrg({
    orgId,
    members,
    invitedFrom,
    extraTrial,
  }: {
    orgId: string;
    members: InviteToOrganizationInput[];
    invitedFrom: string;
    extraTrial?: boolean;
  }): Promise<
    IBasicResponse & {
      organization: IOrganization;
      invitations: OrganizationMemberInvitation[];
      sameDomainEmails?: string[];
      notSameDomainEmails?: string[];
    }
  >;

  export function extraTrialDaysOrganization({
    orgId,
    days,
    action,
  }: {
    orgId: string;
    days: number;
    action: string;
  }): Promise<IBasicResponse>;

  export function updateInviteUsersSetting({
    orgId,
    inviteUsersSetting,
  }: {
    orgId: string;
    inviteUsersSetting: InviteUsersSetting;
  }): Promise<IOrganization['settings']>;

  export function isOrgMember(userRole: string): boolean;

  export function createOrganizationSubscription(
    orgId: string,
    input: ICreateOrganizationSubscriptionInput
  ): Promise<IChargeData>;

  export function sendRequestJoinOrg({
    orgId,
  }: {
    orgId: string;
  }): Promise<{ orgData: IOrganization; newOrg: IOrganization }>;

  export function requestJoinOrganization(): Promise<void>;

  export function joinOrganization({ orgId }: { orgId: string }): Promise<{ organization: IOrganization }>;

  export function acceptOrganizationInvitation({ orgId }: { orgId: string }): Promise<{ organization: IOrganization }>;

  export function getRepresentativeMembers({
    teamId,
    orgId,
  }: {
    teamId?: string;
    orgId: string;
  }): Promise<{ representativeMembers: Pick<IUser, '_id' | 'avatarRemoteId' | 'email' | 'name'>[] }>;

  export function isOrgAdmin(userRole: string): boolean;

  export function getUsersInvitableToOrg(input: { orgId: string; userEmails: string[] }): Promise<string[]>;

  export function checkOrganizationDocStack(
    orgId: string,
    { signal }?: { signal: AbortSignal }
  ): Promise<{ isOverDocStack: boolean }>;

  export function getSuggestedUsersToInvite(input: {
    orgId: string;
    accessToken?: string;
    forceUpdate?: boolean;
    googleAuthorizationEmail?: string;
  }): Promise<{
    suggestedUsers: { _id: string; name: string; email: string; remoteName: string; avatarRemoteId: string }[];
  }>;

  export function inviteMemberToAddDocStack(input: {
    orgId: string;
    members: {
      email: string;
      role: string;
    }[];
  }): Promise<{
    message: string;
    statusCode: number;
    organization: IOrganization;
    invitations: OrganizationMemberInvitation[];
  }>;

  export function getOrganizationWithJoinStatus(orgId: string): Promise<SuggestedPremiumOrganization>;

  export function getOrganizationFolderTree(orgId: string): Promise<{ children: NestedPlainData[] }>;

  export function getPersonalFolderTreeInOrg(orgId: string): Promise<{ children: NestedPlainData[] }>;

  export function getOrganizationTeamsFolderTree(payload: { orgId: string; teamIds: string[] }): Promise<{
    teams: {
      _id: string;
      name: string;
      children: NestedPlainData[];
    }[];
  }>;

  export function getPersonalFolderTree(): Promise<{ children: NestedPlainData[] }>;

  export function acceptRequestingAccess(input: {
    orgId: string;
    userId: string;
  }): Promise<{ message: string; statusCode: number; data: { email: string } }>;

  export function rejectRequestingAccess(input: {
    orgId: string;
    userId: string;
  }): Promise<{ message: string; statusCode: number }>;

  export function assignSignSeats(input: {
    orgId: string;
    userIds: string[];
  }): Promise<{ message: string; statusCode: number; data: { availableSignSeats: number } }>;

  export function unassignSignSeats(input: {
    orgId: string;
    userIds: string[];
  }): Promise<{ message: string; statusCode: number; data: { availableSignSeats: number } }>;

  export function rejectSignSeatRequests(input: {
    orgId: string;
    userIds: string[];
  }): Promise<{ message: string; statusCode: number }>;

  export function changeAvatarOrganization({ orgId, file }: { orgId: string; file: unknown }): Promise<string>;
  export function setAvatarOrganizationSuggestion({ orgId }: { orgId: string }): Promise<string>;

  export function setAvatarFromSuggestion({ orgId }: { orgId: string }): Promise<string>;
  export function requestSignSeat(input: { orgId: string; requestMessage: string }): Promise<IBasicResponse>;

  export function upsertSamlSsoConfiguration(input: {
    orgId: string;
    domains: string[];
    rawIdpMetadataXml: string;
  }): Promise<SamlSsoConfiguration>;

  export function deleteSamlSsoConfiguration(orgId: string): Promise<IBasicResponse>;

  export function getSamlSsoConfiguration(orgId: string): Promise<SamlSsoConfiguration>;

  export function enableScimSsoProvision(orgId: string): Promise<ScimSsoConfiguration>;

  export function disableScimSsoProvision(orgId: string): Promise<IBasicResponse>;

  export function getScimSsoConfiguration(orgId: string): Promise<ScimSsoConfiguration>;
}

export default organizationServices;
