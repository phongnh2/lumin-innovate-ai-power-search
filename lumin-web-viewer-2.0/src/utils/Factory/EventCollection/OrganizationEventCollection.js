import { AWS_EVENTS } from 'constants/awsEvents';
import { ORGANIZATION_ROLE_SHORTEN } from 'constants/organizationConstants';

import { EventCollection } from './EventCollection';

export class OrganizationEventCollection extends EventCollection {
  create({
    name,
    organizationType,
    organizationId,
    numberOfUsers,
  }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.CREATE,
      attributes: {
        name,
        organizationType,
        organizationId,
        numberOfUsers,
      },
    });
  }

  delete({
    name,
    numberOfUsers,
  }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.DELETE,
      attributes: {
        name,
        numberOfUsers,
      },
    });
  }

  planChanged({
    previousPlanName,
    previousNumberOfUsers,
    newNumberOfUsers,
    newPlanName,
    organizationId,
    previousPlanPeriod,
    newPlanPeriod,
    previousDocStack,
    newDocStack,
  }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.PLAN_CHANGED,
      attributes: {
        previousPlanName,
        previousNumberOfUsers,
        newNumberOfUsers,
        newPlanName,
        organizationId,
        previousPlanPeriod,
        newPlanPeriod,
        previousDocStack,
        newDocStack,
      },
    });
  }

  addUser({
    addedUserId,
    automatic = false,
    organizationUserInvitationId,
    addedRole,
    invitedFrom,
    bulkInvite,
    bulkInviteId,
    invitedEmailDomain,
    inviterEmailDomain,
  }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.ADD_USER,
      attributes: {
        addedUserId,
        automatic,
        organizationUserInvitationId,
        addedRole: ORGANIZATION_ROLE_SHORTEN[addedRole],
        invitedFrom,
        bulkInvite,
        bulkInviteId,
        invitedEmailDomain,
        inviterEmailDomain,
      },
    });
  }

  approveAccessRequest({
    targetUserId,
    organizationAccessRequestId,
  }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.APPROVE_USER_ACCESS_REQUEST,
      attributes: {
        targetUserId,
        organizationAccessRequestId,
      },
    });
  }

  declineAccessRequest({
    targetUserId,
    organizationAccessRequestId,
  }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.DECLINE_USER_ACCESS_REQUEST,
      attributes: {
        targetUserId,
        organizationAccessRequestId,
      },
    });
  }

  removeUser({
    removedUserId,
  }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.REMOVE_USER,
      attributes: {
        removedUserId,
      },
    });
  }

  settingChanged({
    name,
    previousValue,
    newValue,
  }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.SETTING_CHANGED,
      attributes: {
        name,
        previousValue,
        newValue,
      },
    });
  }

  selectSuggestedOrganization({
    position,
    suggestId,
    suggestedOrganizationId,
    permissionType,
    paymentType,
    paymentPeriod,
    paymentStatus,
  }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.SELECT_SUGGESTED_ORGANIZATION,
      attributes: {
        position,
        suggestId,
        suggestedOrganizationId,
        visibility: permissionType,
        paymentType,
        paymentPeriod,
        paymentStatus,
      },
    });
  }

  changeSetting({ elementName, elementPurpose }) {
    return this.record({
      name: AWS_EVENTS.CLICK,
      attributes: {
        elementName,
        elementPurpose,
      },
    });
  }

  userRejectOrganizationInvitation({ targetOrganizationId, organizationUserInvitationId, rejectForever }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.USER_REJECT_ORGANIZATION_INVITATION,
      attributes: {
        targetOrganizationId,
        organizationUserInvitationId,
        rejectForever,
      },
    });
  }

  viewSuggestedOrganization({
    suggestedOrganizationId,
    permissionType,
  }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.VIEW_SUGGESTED_ORGANIZATION,
      attributes: {
        suggestedOrganizationId,
        permissionType,
      },
    });
  }

  userAcceptOrganizationInvitation({ targetOrganizationId, organizationUserInvitationId }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.USER_ACCEPT_ORGANIZATION_INVITATION,
      attributes: {
        targetOrganizationId,
        organizationUserInvitationId,
      },
    });
  }

  reactivateSetToCancelCircle({ organizationId, customerRemoteId, subscriptionRemoteId, planRemoteId }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.REACTIVATE_SET_TO_CANCEL_CIRCLE,
      attributes: {
        organizationId,
        StripeCustomerId: customerRemoteId,
        StripeSubscriptionId: subscriptionRemoteId,
        StripePlanId: planRemoteId,
      },
    });
  }

  reactivateCanceledCircle({ organizationId, customerRemoteId, subscriptionRemoteId, planRemoteId }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.REACTIVATE_CANCELED_CIRCLE,
      attributes: {
        organizationId,
        StripeCustomerId: customerRemoteId,
        StripeSubscriptionId: subscriptionRemoteId,
        StripePlanId: planRemoteId,
      },
    });
  }

  upgradeIntent({ elementName }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.UPGRADE_INTENT,
      attributes: {
        elementName,
      },
    });
  }

  suggestedOrganizationsToJoinOverall({ suggestId, recommendedOrganizationsCount, recommendedPaidOrganizationsCount }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.SUGGESTED_ORGANIZATIONS_TO_JOIN_OVERALL,
      attributes: {
        suggestId,
        recommendedOrganizationsCount,
        recommendedPaidOrganizationsCount,
      },
    });
  }

  suggestedOrganizationsToJoinDetail({
    suggestId,
    position,
    suggestedOrganizationId,
    paymentType,
    paymentStatus,
    paymentPeriod,
    visibility,
  }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.SUGGESTED_ORGANIZATIONS_TO_JOIN_DETAIL,
      attributes: {
        suggestId,
        position,
        suggestedOrganizationId,
        paymentType,
        paymentStatus,
        paymentPeriod,
        visibility,
      },
    });
  }

  docStackAdded({ trigger, numberOfDocs }) {
    return this.record({
      name: AWS_EVENTS.ORGANIZATION.DOC_STACK_ADDED,
      attributes: {
        trigger,
      },
      metrics: { numberOfDocs },
    });
  }
}

export default new OrganizationEventCollection();
