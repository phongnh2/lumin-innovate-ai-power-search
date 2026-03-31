import planUtils from '../planUtils';
import { PERIOD, Plans, STATUS } from 'constants/plan';
import { ORGANIZATION_MAX_MEMBERS } from 'constants/organizationConstants';

describe('planUtils', () => {
  describe('isProfessionDisabled', () => {
    it('should return true when user has PROFESSIONAL plan with same period', () => {
      const currentUser = {
        payment: {
          type: Plans.PROFESSIONAL,
          period: PERIOD.MONTHLY,
        },
      };
      const activePeriod = PERIOD.MONTHLY;

      const result = planUtils.isProfessionDisabled({ currentUser, activePeriod });

      expect(result).toBe(true);
    });

    it('should return true when user has PROFESSIONAL plan with ANNUAL period', () => {
      const currentUser = {
        payment: {
          type: Plans.PROFESSIONAL,
          period: PERIOD.ANNUAL,
        },
      };
      const activePeriod = PERIOD.MONTHLY;

      const result = planUtils.isProfessionDisabled({ currentUser, activePeriod });

      expect(result).toBe(true);
    });

    it('should return true when user has ANNUAL period and activePeriod is MONTHLY', () => {
      const currentUser = {
        payment: {
          type: Plans.FREE,
          period: PERIOD.ANNUAL,
        },
      };
      const activePeriod = PERIOD.MONTHLY;

      const result = planUtils.isProfessionDisabled({ currentUser, activePeriod });

      expect(result).toBe(true);
    });

    it('should return false when conditions are not met', () => {
      const currentUser = {
        payment: {
          type: Plans.FREE,
          period: PERIOD.MONTHLY,
        },
      };
      const activePeriod = PERIOD.ANNUAL;

      const result = planUtils.isProfessionDisabled({ currentUser, activePeriod });

      expect(result).toBe(false);
    });
  });

  describe('isCanceledPlan', () => {
    it('should return true when period matches and status is CANCELED', () => {
      const currentUser = {
        payment: {
          period: PERIOD.MONTHLY,
          status: STATUS.CANCELED,
        },
      };
      const activePeriod = PERIOD.MONTHLY;

      const result = planUtils.isCanceledPlan({ currentUser, activePeriod });

      expect(result).toBe(true);
    });

    it('should return false when period does not match', () => {
      const currentUser = {
        payment: {
          period: PERIOD.MONTHLY,
          status: STATUS.CANCELED,
        },
      };
      const activePeriod = PERIOD.ANNUAL;

      const result = planUtils.isCanceledPlan({ currentUser, activePeriod });

      expect(result).toBe(false);
    });

    it('should return false when status is not CANCELED', () => {
      const currentUser = {
        payment: {
          period: PERIOD.MONTHLY,
          status: STATUS.ACTIVE,
        },
      };
      const activePeriod = PERIOD.MONTHLY;

      const result = planUtils.isCanceledPlan({ currentUser, activePeriod });

      expect(result).toBe(false);
    });
  });

  describe('getCurrentQuantity', () => {
    it('should return orgQuantity for ENTERPRISE plan', () => {
      const currentOrganization = {
        payment: {
          type: Plans.ENTERPRISE,
          quantity: 50,
        },
        totalMember: 30,
      };

      const result = planUtils.getCurrentQuantity(currentOrganization);

      expect(result).toBe(50);
    });

    it('should return ORGANIZATION_MAX_MEMBERS when orgQuantity >= max', () => {
      const currentOrganization = {
        payment: {
          type: Plans.PROFESSIONAL,
          quantity: ORGANIZATION_MAX_MEMBERS + 10,
        },
        totalMember: 30,
      };

      const result = planUtils.getCurrentQuantity(currentOrganization);

      expect(result).toBe(ORGANIZATION_MAX_MEMBERS);
    });

    it('should return totalMember for FREE plan', () => {
      const currentOrganization = {
        payment: {
          type: Plans.FREE,
          quantity: 10,
        },
        totalMember: 25,
      };

      const result = planUtils.getCurrentQuantity(currentOrganization);

      expect(result).toBe(25);
    });

    it('should return orgQuantity when orgQuantity < ORGANIZATION_MAX_MEMBERS', () => {
      const currentOrganization = {
        payment: {
          type: Plans.PROFESSIONAL,
          quantity: 20,
        },
        totalMember: 30,
      };

      const result = planUtils.getCurrentQuantity(currentOrganization);

      expect(result).toBe(20);
    });

    it('should handle missing payment object', () => {
      const currentOrganization = {
        totalMember: 30,
      };

      const result = planUtils.getCurrentQuantity(currentOrganization);

      expect(result).toBe(1);
    });
  });

  describe('getNextQuantity', () => {
    it('should return quantity + 1 for ENTERPRISE plan', () => {
      const organization = {
        payment: {
          type: Plans.ENTERPRISE,
          quantity: 50,
          period: PERIOD.MONTHLY,
        },
        totalMember: 30,
      };

      const result = planUtils.getNextQuantity({ organization, isAnnualSelecting: false });

      expect(result).toBe(51);
    });

    it('should return totalMember for FREE plan', () => {
      const organization = {
        payment: {
          type: Plans.FREE,
          quantity: 10,
          period: PERIOD.MONTHLY,
        },
        totalMember: 25,
      };

      const result = planUtils.getNextQuantity({ organization, isAnnualSelecting: false });

      expect(result).toBe(25);
    });

    it('should increase quantity when period is MONTHLY and not annual selecting', () => {
      const organization = {
        payment: {
          type: Plans.PROFESSIONAL,
          quantity: 20,
          period: PERIOD.MONTHLY,
        },
        totalMember: 15,
      };

      const result = planUtils.getNextQuantity({ organization, isAnnualSelecting: false });

      expect(result).toBe(21);
    });

    it('should not increase quantity when upgrading from MONTHLY to ANNUAL', () => {
      const organization = {
        payment: {
          type: Plans.PROFESSIONAL,
          quantity: 20,
          period: PERIOD.MONTHLY,
        },
        totalMember: 15,
      };

      const result = planUtils.getNextQuantity({ organization, isAnnualSelecting: true });

      expect(result).toBe(20);
    });

    it('organization and isAnnualSelecting are null', () => {
      expect(planUtils.getNextQuantity({ organization: null, isAnnualSelecting: null })).toBe(NaN);
    });
  });
});
