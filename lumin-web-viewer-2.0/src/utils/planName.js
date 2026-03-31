import { Plans } from 'constants/plan';

const FreePlan = (currentUser) => {
  switch (currentUser.payment.type) {
    case Plans.FREE:
      return 'Your Current Plan';
    case Plans.FREE_TRIAL:
      return 'You are on Free Trial';
    default:
      return `You are on ${currentUser.payment.type.toLowerCase()}`;
  }
};

export default { FreePlan };
