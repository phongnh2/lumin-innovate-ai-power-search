/* eslint-disable class-methods-use-this */
import { store } from 'src/redux/store';

import selectors from 'selectors';

import logger from 'helpers/logger';

import { hotjarUtils } from 'utils';
import { ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import organizationEvent from 'utils/Factory/EventCollection/OrganizationEventCollection';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { LOGGER } from 'constants/lumin-common';
import { ORGANIZATION_CREATION_TYPE } from 'constants/organizationConstants';

import commonUtils from '../../utils/common';

const { getState } = store;

const NON_LUMIN_USER = 'nonLuminUser';

class OrganizationTracking {
  GOOGLE_SIGN_IN = 'Google - Sign in';

  AUTO_APPROVE = 'Auto approve';

  PASSWORD_STRENGTH = 'Password strength';

  AUTO_UPGRADE = 'AutoUpgrade';

  currentUser = null;

  getOrganization() {
    return selectors.getCurrentOrganization(getState()).data;
  }

  getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = selectors.getCurrentUser(getState());
    }
    return this.currentUser;
  }

  trackCreate({ type, organization }) {
    const orgTypeMap = {
      [ORGANIZATION_CREATION_TYPE.AUTOMATIC]: 'main',
      [ORGANIZATION_CREATION_TYPE.MANUAL]: 'custom',
    };
    const {
      _id: organizationId,
      name,
      totalMember,
    } = organization;
    organizationEvent.create({
      organizationId,
      name,
      organizationType: orgTypeMap[type],
      numberOfUsers: totalMember,
    });
  }

  trackAddUser({ members, invitations, invitedFrom, bulkInvite, bulkInviteId }) {
    const currentUser = this.getCurrentUser();
    const inviterEmailDomain = commonUtils.getDomainFromEmail(currentUser?.email || '');
    members.forEach(({ _id, email, role }) => {
      organizationEvent.addUser({
        addedUserId: _id || '',
        organizationUserInvitationId:
          invitations.find(({ memberEmail }) => memberEmail === email)?.invitationId || '',
        addedRole: role,
        invitedFrom,
        bulkInvite,
        bulkInviteId,
        invitedEmailDomain: commonUtils.getDomainFromEmail(email),
        inviterEmailDomain,
      });
      hotjarUtils.trackEvent(HOTJAR_EVENT.ORGANIZATION_ADD_USER);
    });

    // Log info to Datadog
    logger.logInfo({
      message: LOGGER.EVENT.INVITE_MEMBER_TO_ORGANIZATION,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
      attributes: {
        addedUserId: members.map((member) => member._id || NON_LUMIN_USER),
      },
    });
    members.forEach(({ _id }) => {
      logger.logInfo({
        message: LOGGER.EVENT.INVITED_TO_ORGANIZATION,
        reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
        attributes: {
          addedUserId: _id,
        },
      });
    });
  }

  trackRemoveUser(userId) {
    organizationEvent.removeUser({
      removedUserId: userId,
    });

    // Log info to Datadog
    logger.logInfo({
      message: LOGGER.EVENT.REMOVE_MEMBER_FROM_ORGANIZATION,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
      attributes: {
        removedUserId: userId || NON_LUMIN_USER,
      },
    });
    logger.logInfo({
      message: LOGGER.EVENT.REMOVED_FROM_ORGANIZATION,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
      attributes: {
        removedUserId: userId || NON_LUMIN_USER,
      },
    });
  }

  trackDelete() {
    const currentOrganization = this.getOrganization();
    if (!currentOrganization) {
      return;
    }
    const { totalMember, name } = currentOrganization;
    organizationEvent.delete({
      name,
      numberOfUsers: totalMember,
    });
  }

  trackApproveRequest({ userId, organizationId }) {
    organizationEvent.approveAccessRequest({
      targetUserId: userId,
      organizationAccessRequestId: organizationId,
    });
  }

  trackRejectRequest(userId, orgId) {
    try {
      organizationEvent.declineAccessRequest({
        targetUserId: userId,
        organizationAccessRequestId: orgId,
      });
    } catch (err) {
      logger.logError({
        message: 'Failed to reject organization access request',
        error: err,
        userId,
      });
    }
  }

  trackSettingChanged({
    name,
    previousValue,
    newValue,
  }) {
    organizationEvent.settingChanged({
      name,
      previousValue,
      newValue,
    });
  }

  trackSelectSuggestedOrganization({
    position,
    suggestId,
    suggestedOrganizationId,
    permissionType,
    paymentType,
    paymentPeriod,
    paymentStatus,
  }) {
    organizationEvent.selectSuggestedOrganization({
      position,
      suggestId,
      suggestedOrganizationId,
      permissionType,
      paymentType,
      paymentPeriod,
      paymentStatus,
    });
  }

  trackChangeSetting({ elementName }) {
    const elementPurpose = ButtonPurpose[elementName];
    organizationEvent.changeSetting({
      elementName,
      elementPurpose,
    });
  }

  trackUserRejectOrganizationInvitation({ targetOrganizationId, organizationUserInvitationId, rejectForever }) {
    organizationEvent.userRejectOrganizationInvitation({
      targetOrganizationId,
      organizationUserInvitationId,
      rejectForever,
    });
  }

  trackViewSuggestedOrganization({
    suggestedOrganizationId,
    permissionType,
  }) {
    organizationEvent.viewSuggestedOrganization({
      suggestedOrganizationId,
      permissionType,
    });
  }

  trackUserAcceptOrganizationInvitation({ targetOrganizationId, organizationUserInvitationId }) {
    organizationEvent.userAcceptOrganizationInvitation({
      targetOrganizationId,
      organizationUserInvitationId,
    });
  }

  trackReactivateSetToCancelCircle({ organizationId, customerRemoteId, subscriptionRemoteId, planRemoteId }) {
    organizationEvent.reactivateSetToCancelCircle({
      organizationId,
      customerRemoteId,
      subscriptionRemoteId,
      planRemoteId,
    });
  }

  trackReactivateCanceledCircle({ organizationId, customerRemoteId, subscriptionRemoteId, planRemoteId }) {
    organizationEvent.reactivateCanceledCircle({
      organizationId,
      customerRemoteId,
      subscriptionRemoteId,
      planRemoteId,
    });
  }

  trackUpgradeIntent({ elementName }) {
    organizationEvent.upgradeIntent({
      elementName,
    });
  }

  trackSuggestedOrganizationsToJoinOverall(attributes) {
    organizationEvent.suggestedOrganizationsToJoinOverall(attributes);
  }

  trackSuggestedOrganizationsToJoinDetail(attributes) {
    organizationEvent.suggestedOrganizationsToJoinDetail(attributes);
  }
}

export default new OrganizationTracking();
