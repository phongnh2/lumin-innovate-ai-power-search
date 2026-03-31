import { PaymentPeriod, PaymentPlans, PaymentStatus } from 'constants/plan.enum';

declare class OrganizationTracking {
  AUTO_UPGRADE: string;

  trackSettingChanged({
    name,
    previousValue,
    newValue,
  }: {
    name: string;
    previousValue: boolean;
    newValue: boolean;
  }): void;

  trackChangeSetting({ elementName }: { elementName: string }): void;

  trackReactivateSetToCancelCircle({
    organizationId,
    customerRemoteId,
    subscriptionRemoteId,
    planRemoteId,
  }: {
    organizationId: string;
    customerRemoteId: string;
    subscriptionRemoteId: string;
    planRemoteId: string;
  }): void;

  trackReactivateCanceledCircle({
    organizationId,
    customerRemoteId,
    subscriptionRemoteId,
    planRemoteId,
  }: {
    organizationId: string;
    customerRemoteId: string;
    subscriptionRemoteId: string;
    planRemoteId: string;
  }): void;

  trackSelectSuggestedOrganization({
    position,
    suggestId,
    suggestedOrganizationId,
    permissionType,
    paymentType,
    paymentPeriod,
    paymentStatus,
  }: {
    position?: number;
    suggestId?: string;
    suggestedOrganizationId: string;
    permissionType: string;
    paymentType?: PaymentPlans;
    paymentPeriod?: PaymentPeriod;
    paymentStatus?: PaymentStatus;
  }): void;

  trackUpgradeIntent({ elementName }: { elementName: string }): void;

  trackSuggestedOrganizationsToJoinOverall({
    suggestId,
    recommendedOrganizationsCount,
    recommendedPaidOrganizationsCount,
  }: {
    suggestId: string;
    recommendedOrganizationsCount: number;
    recommendedPaidOrganizationsCount: number;
  }): void;

  trackSuggestedOrganizationsToJoinDetail({
    suggestId,
    position,
    suggestedOrganizationId,
    paymentType,
    paymentStatus,
    paymentPeriod,
    visibility,
  }: {
    suggestId: string;
    position: number;
    suggestedOrganizationId: string;
    paymentType: PaymentPlans;
    paymentPeriod: PaymentPeriod;
    paymentStatus: PaymentStatus;
    visibility: string;
  }): void;

  trackApproveRequest({ userId, organizationId }: { userId: string; organizationId: string }): void;

  trackRejectRequest({ userId, organizationId }: { userId: string; organizationId: string }): void;

  trackAddUser(payload: {
    members: {
      _id: string;
      email: string;
      role: string;
    }[];
    invitations: {
      invitationId: string;
      memberEmail: string;
    }[];
    invitedFrom?: string;
    bulkInvite?: string;
    bulkInviteId?: string;
  }): void;
}

export const organizationTracking: OrganizationTracking;

export default organizationTracking;
