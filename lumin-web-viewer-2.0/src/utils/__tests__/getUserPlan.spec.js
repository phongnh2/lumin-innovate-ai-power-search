import getUserPlan from '../getUserPlan';
import { PLAN_TYPE, Plans } from 'constants/plan';

describe('getUserPlan', () => {
  it('should return plan professional if user in team professional', () => {
    const organizations = [
      {
        organization: {
          payment: {
            type: PLAN_TYPE.PROFESSIONAL,
          },
        },
      },
      {
        organization: {
          payment: {
            type: PLAN_TYPE.FREE,
          },
        },
      },
    ];
    expect(
      getUserPlan({ payment: { type: PLAN_TYPE.FREE } }, organizations)
    ).toBe(Plans.PROFESSIONAL);
  });
  it('should return plan professional if user payment type professional', () => {
    expect(getUserPlan({ payment: { type: PLAN_TYPE.PROFESSIONAL } }, [])).toBe(
      Plans.PROFESSIONAL
    );
  });
  it('should return plan free trial if user payment type free trial', () => {
    expect(getUserPlan({ payment: { type: PLAN_TYPE.FREE_TRIAL } }, [])).toBe(
      Plans.FREE_TRIAL
    );
  });
  it('should return plan personal if user payment type personal', () => {
    expect(getUserPlan({ payment: { type: PLAN_TYPE.PERSONAL } }, [])).toBe(
      Plans.PERSONAL
    );
  });
  it('should return plan free if user payment type free or user team free', () => {
    expect(getUserPlan({ payment: { type: PLAN_TYPE.FREE } }, [])).toBe(
      Plans.FREE
    );
  });
});
