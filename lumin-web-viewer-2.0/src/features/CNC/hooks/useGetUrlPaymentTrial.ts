import { get } from 'lodash';

import useGetPeriodProTrialPlanFlag from 'hooks/growthBook/featureflags/useGetPeriodProTrialPlanFlag';

import { PaymentHelpers, PaymentUrlSerializer } from 'utils/payment';

import { PERIOD, Plans } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';

const useGetUrlPaymentTrial = ({ currentOrg }: { currentOrg: IOrganization }) => {
  const {
    isOn: isUsingPeriodOnFlag,
    period: periodOnFlag,
    fromParam: fromParamOnFlag,
  } = useGetPeriodProTrialPlanFlag();

  const trialInfo = get(currentOrg, 'payment.trialInfo', {});
  const trialPlan = PaymentHelpers.evaluateTrialPlan(trialInfo);
  const _plan = isUsingPeriodOnFlag ? Plans.ORG_PRO : trialPlan;
  const _period = isUsingPeriodOnFlag ? periodOnFlag : PERIOD.ANNUAL;
  const _from = isUsingPeriodOnFlag ? fromParamOnFlag : null;

  const getUrlPaymentTrial = (): string => {
    const serializer = new PaymentUrlSerializer()
      .trial(true)
      .of(currentOrg._id)
      .plan(_plan)
      .period(_period)
      .returnUrlParam();
    serializer.fromParam(_from);
    return serializer.get();
  };

  return { getUrlPaymentTrial, plan: _plan, period: _period, from: _from };
};

export { useGetUrlPaymentTrial };
