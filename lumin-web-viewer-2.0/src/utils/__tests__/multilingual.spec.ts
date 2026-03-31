import { PaymentPlans } from 'constants/plan.enum';
import { getPlanDescription, getPdfPlanLabel, getSignPlanLabel, getOldTermsContext } from '../multilingual';

describe('multilingual', () => {
  it('getPlanDescription', () => {
    expect(getPlanDescription({ t: (key) => key, type: PaymentPlans.FREE })).toBe('common.freePlan');
    expect(getPlanDescription({ t: (key) => key, type: PaymentPlans.PROFESSIONAL })).toBe('common.planDescription');
  });
  it('getPdfPlanLabel', () => {
    expect(getPdfPlanLabel({ t: (key) => key, type: PaymentPlans.FREE })).toBe('common.free');
    expect(getPdfPlanLabel({ t: (key) => key, type: PaymentPlans.PROFESSIONAL })).toBe('Professional');
    expect(getPdfPlanLabel({ t: (key) => key, type: PaymentPlans.PROFESSIONAL, isTrial: true })).toBe('common.planTrial');
  });
  it('getSignPlanLabel', () => {
    expect(getSignPlanLabel({ type: PaymentPlans.FREE })).toBe('Free');
  });
  it('getOldTermsContext', () => {
    expect(getOldTermsContext(true)).toBe('old');
    expect(getOldTermsContext(false)).toBeUndefined();
  });
});