import paymentUtil from '../paymentUtil';

describe('paymentUtil', () => {
  describe('convertCurrencySymbol', () => {
    it('should return Dollar', () => {
      expect(paymentUtil.convertCurrencySymbol('USD')).toBe('$');
    });
    it('should return Dollar (wrong input)', () => {
      expect(paymentUtil.convertCurrencySymbol('VND')).toBe('$');
    });
  });

  describe('getPlanType', () => {
    it('should return PROFESSIONAL for INDIVIDUAL', () => {
      expect(paymentUtil.getPlanType('INDIVIDUAL')).toBe('PROFESSIONAL');
    });
  });  

  describe('getPrice', () => {
    it('should return 10 for PROFESSIONAL', () => {
      expect(paymentUtil.getPrice({ plan: 'PROFESSIONAL', period: 'MONTHLY' })).toBe(19);
    });
    it('should run into isConvertFromTeam', () => {
      expect(paymentUtil.getPrice({ plan: 'BUSINESS', period: 'MONTHLY', isConvertFromTeam: true })).toBe(5);
    });
    it('should run into NEW_PRICING_PLAN_LIST', () => {
      expect(paymentUtil.getPrice({ plan: 'ORG_STARTER', period: 'MONTHLY' })).toBe(15);
    });
  });

  describe('getOrganizationPrice', () => {
    it('should return 10 for PROFESSIONAL', () => {
      expect(paymentUtil.getOrganizationPrice({ plan: 'PROFESSIONAL', period: 'MONTHLY', quantity: 1 })).toBe(19);
    });
  });

  describe('getQuantityInOrgOldPlan', () => {
    it('should return 1 for PROFESSIONAL', () => {
      expect(paymentUtil.getQuantityInOrgOldPlan({ totalMember: 1, payment: { quantity: 1 } })).toBe(1);
    });
  });

  describe('isValidQuantity', () => {
    it('should return true for 1', () => {
      expect(paymentUtil.isValidQuantity(1)).toBe(true);
    });
  });

  describe('getNextBillingDateFreeTrial', () => {
    it('should return date', () => {
      expect(paymentUtil.getNextBillingDateFreeTrial()).not.toBeNull();
    });
  });

  describe('getStatementDescriptor', () => {
    it('should return statement descriptor', () => {
      expect(paymentUtil.getStatementDescriptor('123')).toBe('Lumin 123');
    });
    it('should return empty string for null', () => {
      expect(paymentUtil.getStatementDescriptor(null)).toBe('');
    });
  });

  describe('getFreetrialType', () => {
    it('should return 1 for Professional', () => {
      expect(paymentUtil.getFreetrialType('PROFESSIONAL')).toBe('Professional');
    });
  });

  describe('getNextDocStackBlock', () => {
    it('quanity undefined', () => {
      expect(paymentUtil.getNextDocStackBlock({ currentPlan: 'PROFESSIONAL', currentPeriod: 'MONTHLY', currentStatus: 'TRIALING', totalDocStackUsed: 100, nextPlan: 'PROFESSIONAL', nextPeriod: 'ANNUAL' })).toBe(NaN);
    });
    it('case 1', () => {
      expect(paymentUtil.getNextDocStackBlock({
        quantity: 1,
        currentPlan: 'BUSINESS',
        currentPeriod: 'MONTHLY',
        currentStatus: 'TRIALING',
        totalDocStackUsed: 100,
        nextPlan: 'ORG_STARTER',
        nextPeriod: 'ANNUAL'
      })).toBe(1);
    });

    it('hit upcomingDocStackUnit >= totalDocStackUsed branch', () => {
      expect(paymentUtil.getNextDocStackBlock({
        quantity: 0,
        currentPlan: 'ORG_STARTER',
        currentPeriod: 'MONTHLY',
        currentStatus: 'TRIALING',
        totalDocStackUsed: 5,
        nextPlan: 'ORG_STARTER',
        nextPeriod: 'MONTHLY',
      })).toBe(1);
    });
    
    it('hit isUpradeDocStackOnly branch', () => {
      expect(paymentUtil.getNextDocStackBlock({
        quantity: 3,
        currentPlan: 'PROFESSIONAL',    
        currentPeriod: 'MONTHLY',       
        currentStatus: 'ACTIVE',        
        totalDocStackUsed: 100,        
        nextPlan: 'PROFESSIONAL',
        nextPeriod: 'MONTHLY',
      })).toBe(4);
    });    

    it('hit final Math.ceil branch with isNewPlan', () => {
      expect(paymentUtil.getNextDocStackBlock({
        quantity: 3,
        currentPlan: 'ORG_PRO',
        currentPeriod: 'MONTHLY',
        currentStatus: 'ACTIVE',
        totalDocStackUsed: 0,
        nextPlan: 'ORG_PRO',
        nextPeriod: 'ANNUAL',
      })).toBe(Math.ceil(3 * 30 / 200));
    });

    it('hit final Math.ceil branch', () => {
      expect(paymentUtil.getNextDocStackBlock({
        quantity: 3,
        currentPlan: 'ORG_PRO',
        currentPeriod: 'ANNUAL',
        currentStatus: 'ACTIVE',     
        totalDocStackUsed: 0,        
        nextPlan: 'ORG_PRO',
        nextPeriod: 'MONTHLY',       
      })).toBe(Math.ceil(20)); 
    });
  });

  describe('getNextDocStack', () => {
    it('case 0', () => {
      const currentPeriod = 'MONTHLY';
      const currentPlan = 'ORG_PRO';
      const nextPeriod = 'ANNUAL';
      const nextPlan = 'ORG_PRO';
      expect(paymentUtil.getNextDocStack({ nextPeriod, nextPlan, currentPeriod, currentPlan }).nextDocStack).toBe(200);
    });
  });
});
