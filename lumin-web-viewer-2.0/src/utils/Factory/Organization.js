import { PaymentHelpers } from 'utils/payment';

import { InviteUsersSetting } from 'constants/organization.enum';
import { ORGANIZATION_ROLES, ORG_TEAM_ROLE, ORGANIZATION_CREATION_TYPE } from 'constants/organizationConstants';

import { PaymentUtilities } from './Payment';

export class OrganizationUtilities {
  constructor({ organization }) {
    this.organization = organization || {};
    this.teams = this.organization.teams || [];
    this.paymentUtilities = new PaymentUtilities(this.organization.payment);
    this.domain = this.organization.domain || {};
    this.associateDomains = this.organization.associateDomains || {};
    this.creationType = this.organization.creationType || {};
    this.totalMember = this.organization.totalMember || {};
    this.quantity = this.payment.getQuantity();
    this.settings = this.organization.settings || {};
  }

  getRole() {
    return this.organization.userRole?.toUpperCase();
  }

  get payment() {
    return this.paymentUtilities;
  }

  isTeamAdmin() {
    return this.teams.find((team) => team.roleOfUser.toUpperCase() === ORG_TEAM_ROLE.ADMIN);
  }

  isMember() {
    return this.getRole() === ORGANIZATION_ROLES.MEMBER;
  }

  isAdmin() {
    return this.getRole() === ORGANIZATION_ROLES.ORGANIZATION_ADMIN;
  }

  isModerator() {
    return this.getRole() === ORGANIZATION_ROLES.BILLING_MODERATOR;
  }

  isConvertedFromTeam() {
    return this.convertFromTeam;
  }

  isManager() {
    return this.isAdmin() || this.isModerator();
  }

  domainList() {
    const isMainOrg = this.creationType === ORGANIZATION_CREATION_TYPE.AUTOMATIC;

    return isMainOrg ? [this.domain, ...this.associateDomains] : this.associateDomains;
  }

  getDomainsWithAtSign() {
    return this.domainList().join(', ');
  }

  hasSlot() {
    return this.totalMember < this.quantity;
  }

  isLastActiveOrg() {
    return this.organization.isLastActiveOrg;
  }

  hasUnlimitedMember() {
    const {
      payment: { type },
    } = this.payment;
    return this.paymentUtilities.isFree() || PaymentHelpers.isDocStackPlan(type);
  }

  getUrl() {
    return this.organization.url;
  }

  hasInviteUsersPermission() {
    if (!this.settings.inviteUsersSetting) {
      return false;
    }
    if (this.isMember()) {
      return this.settings.inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE;
    }
    return this.isManager();
  }

  isSignProSeat() {
    return this.organization.isSignProSeat;
  }

  canUpgradeSign() {
    return !this.isSignProSeat() && !this.paymentUtilities.isUnifyFree();
  }

  isUpgradeSignSeat() {
    return this.isManager() && this.canUpgradeSign();
  }

  isRequestUpgradeSignSeat() {
    return this.isMember() && this.canUpgradeSign();
  }
}
