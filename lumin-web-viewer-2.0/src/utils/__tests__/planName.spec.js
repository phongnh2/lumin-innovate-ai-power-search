import { PLAN_TYPE } from 'constants/plan';
import planName from '../planName';

describe('get PlanName', () => {
  it('should return plan professional', () => {
    const currentUser = {
      payment: {
        type: PLAN_TYPE.PROFESSIONAL,
      },
    };

    expect(planName.FreePlan(currentUser)).toBe(`You are on ${currentUser.payment.type.toLowerCase()}`);
  });
  it('should return plan Free', () => {
    const currentUser = {
      payment: {
        type: PLAN_TYPE.FREE,
      },
    };

    expect(planName.FreePlan(currentUser)).toBe('Your Current Plan');
  });

  it('should return plan Free Trial', () => {
    const currentUser = {
      payment: {
        type: PLAN_TYPE.FREE_TRIAL,
      },
    };

    expect(planName.FreePlan(currentUser)).toBe('You are on Free Trial');
  });
});
