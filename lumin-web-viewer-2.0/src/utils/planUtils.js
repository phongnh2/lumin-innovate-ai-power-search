import { ORGANIZATION_MAX_MEMBERS } from 'constants/organizationConstants';
import {
  PERIOD, Plans, STATUS,
} from 'constants/plan';

function isProfessionDisabled({ currentUser, activePeriod }) {
  return (currentUser.payment.type === Plans.PROFESSIONAL &&
    (currentUser.payment.period === activePeriod ||
      currentUser.payment.period === PERIOD.ANNUAL)) ||
  (currentUser.payment.period === PERIOD.ANNUAL &&
    activePeriod === PERIOD.MONTHLY);
}

function isCanceledPlan({ currentUser, activePeriod }) {
  return currentUser.payment.period === activePeriod &&
  currentUser.payment.status === STATUS.CANCELED;
}

const getCurrentQuantity = (currentOrganization) => {
  const currentOrgPlan = currentOrganization.payment?.type;
  const orgQuantity = currentOrganization.payment?.quantity;
  const { totalMember } = currentOrganization;
  const isEnterprisePlan = currentOrgPlan === Plans.ENTERPRISE;
  const isFreePlan = currentOrgPlan === Plans.FREE;

  if (isEnterprisePlan) {
    return orgQuantity;
  }

  if (orgQuantity >= ORGANIZATION_MAX_MEMBERS) {
    return ORGANIZATION_MAX_MEMBERS;
  }

  if (isFreePlan) {
    return totalMember;
  }

  if (orgQuantity < ORGANIZATION_MAX_MEMBERS) {
    return orgQuantity;
  }

  return 1;
};

const getNextQuantity = ({ organization, isAnnualSelecting }) => {
  const { payment, totalMember } = organization || {};
  const { type, quantity, period } = payment || {};
  const isEnterprisePlan = type === Plans.ENTERPRISE;
  const isFreePlan = type === Plans.FREE;
  if (isEnterprisePlan) {
    return quantity + 1;
  }

  if (isFreePlan) {
    return totalMember;
  }

  return Math.min(
    /**
     * we don't increase the member quantity automatically when upgrading from
     * Monthly to Annual
     */
    Math.max(quantity, totalMember) + (period === PERIOD.MONTHLY && isAnnualSelecting ? 0 : 1),
    ORGANIZATION_MAX_MEMBERS,
  );
};

export default {
  isProfessionDisabled,
  isCanceledPlan,
  getCurrentQuantity,
  getNextQuantity,
};
