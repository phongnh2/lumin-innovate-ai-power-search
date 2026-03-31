import { PLAN_TYPE, Plans } from 'constants/plan';

export default (currentUser, organizations = []) => {
  const { payment: userPayment } = currentUser;
  if (organizations?.some(({ organization }) => organization.payment.type !== PLAN_TYPE.FREE)) {
    return Plans.PROFESSIONAL;
  }
  if (userPayment.type === PLAN_TYPE.PROFESSIONAL) {
    return Plans.PROFESSIONAL;
  }
  if (userPayment.type === PLAN_TYPE.PERSONAL) {
    return Plans.PERSONAL;
  }
  if (userPayment.type === PLAN_TYPE.FREE_TRIAL) {
    return Plans.FREE_TRIAL;
  }
  return Plans.FREE;
};
