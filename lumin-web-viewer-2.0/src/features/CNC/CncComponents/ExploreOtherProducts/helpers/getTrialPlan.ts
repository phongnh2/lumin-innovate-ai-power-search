import { isEmpty } from 'lodash';

import { PaymentHelpers } from 'utils/payment';

import { PaymentPlans } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

export const getTrialPlan = (orgOwnCurrentDocument: IOrganization): PaymentPlans => {
  if (isEmpty(orgOwnCurrentDocument)) {
    return PaymentPlans.ORG_PRO;
  }
  return PaymentHelpers.evaluateTrialPlan(orgOwnCurrentDocument.payment.trialInfo) as PaymentPlans;
};
