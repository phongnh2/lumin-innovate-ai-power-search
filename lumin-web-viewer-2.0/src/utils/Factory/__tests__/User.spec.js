import { UserUtilities } from '../User';
import { Plans } from 'constants/plan';

describe('UserUtilities', () => {
  test('isFree returns true when payment.type = FREE', () => {
    const util = new UserUtilities({
      user: {
        payment: { type: Plans.FREE },
      },
    });

    expect(util.isFree()).toBe(true);
    expect(util.isPremium()).toBe(false);
  });

  test('isPremium returns true when payment.type != FREE', () => {
    const util = new UserUtilities({
      user: {
        payment: { type: Plans.BUSINESS },
      },
    });

    expect(util.isFree()).toBe(false);
    expect(util.isPremium()).toBe(true);
  });

  test('handles missing payment gracefully', () => {
    const util = new UserUtilities({
      user: {},
    });

    expect(util.isFree()).toBe(false);
    expect(util.isPremium()).toBe(true);
  });
});
