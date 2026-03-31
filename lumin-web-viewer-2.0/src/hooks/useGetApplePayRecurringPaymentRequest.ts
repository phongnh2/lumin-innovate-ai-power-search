import { useEffect, useState } from 'react';

import { useMatchPaymentRoute } from 'hooks';

import { loggerServices } from 'services';

import { isSafari } from 'helpers/device';

import { paymentUtil } from 'utils';

import { ORG_TEXT } from 'constants/organizationConstants';
import { PERIOD, PLAN_TYPE_LABEL } from 'constants/plan';
import { PaymentPeriod, PaymentPlans, PaymentStatus } from 'constants/plan.enum';
import { BASEURL } from 'constants/urls';

import { IOrganization } from 'interfaces/organization/organization.interface';

interface ApplePaymentPaymentRequest {
  paymentDescription: string;
  regularBilling: {
    // amount in cents
    amount: number;
    label: string;
    recurringPaymentStartDate?: Date;
    recurringPaymentEndDate?: Date;
    recurringPaymentIntervalUnit?: string;
    recurringPaymentIntervalCount?: number;
  };
  billingAgreement?: string;
  managementURL: string;
}

type Props = {
  billingInfo: {
    period: string;
    plan: string;
    isFreeTrial: boolean;
    quantity?: number;
  };
  currentOrganization: IOrganization;
  isModal?: boolean;
};

function useGetApplePayRecurringPaymentRequest({
  billingInfo,
  currentOrganization,
  isModal = false,
}: Props): ApplePaymentPaymentRequest {
  const def = useMatchPaymentRoute();
  const { period, plan, isFreeTrial } = isModal ? billingInfo : def;
  const isMonthly = period === PERIOD.MONTHLY;
  const [result, setResult] = useState<ApplePaymentPaymentRequest | undefined>(undefined);

  useEffect(() => {
    if (!isSafari || !currentOrganization) {
      setResult(undefined);
      return;
    }
    const { quantity = 1 } = billingInfo;
    const { convertFromTeam, domain, payment, docStackStorage } = currentOrganization;
    const planPrice = paymentUtil.getOrganizationPrice({
      plan: plan as PaymentPlans,
      period: period as PaymentPeriod,
      quantity: Math.max(Number(quantity), 1),
      isConvertedFromTeam: convertFromTeam,
    });
    const { type: currentPlan, period: currentPeriod, status: currentStatus } = payment;
    const { totalBlock } = paymentUtil.getNextDocStack({
      quantity: Math.max(Number(quantity), 1),
      currentPeriod: currentPeriod as PaymentPeriod,
      currentPlan,
      currentStatus: currentStatus as PaymentStatus,
      nextPeriod: period as PaymentPeriod,
      nextPlan: plan as PaymentPlans,
      totalDocStackUsed: docStackStorage?.totalUsed,
    });
    const planLabel = PLAN_TYPE_LABEL[plan as keyof typeof PLAN_TYPE_LABEL];
    const paymentDescription = `Lumin ${planLabel} ${isMonthly ? 'monthly' : 'annual'} plan`;
    const billingLabel = `Lumin ${planLabel} plan`;
    const recurringPaymentStartDate = isFreeTrial ? new Date().setDate(new Date().getDate() + 7) : null;
    const recurringPaymentIntervalUnit = isMonthly ? 'month' : 'year';
    const recurringPaymentIntervalCount = 1;
    const trialPlanBillingAgreement = `Agreement for ${
      isMonthly ? 'monthly' : 'annual'
    } recurring payments after a 7-day trial`;
    const paidPlanBillingAgreement = `Agreement for ${isMonthly ? 'monthly' : 'annual'} recurring payments`;
    const managementURL = `${BASEURL}/${ORG_TEXT}/${domain}/dashboard/billing`;

    const recurringPaymentRequest: ApplePaymentPaymentRequest = {
      paymentDescription,
      regularBilling: {
        amount: (planPrice * totalBlock || 0) * 100,
        label: billingLabel,
        ...(recurringPaymentStartDate && { recurringPaymentStartDate: new Date(recurringPaymentStartDate) }),
        recurringPaymentIntervalUnit,
        recurringPaymentIntervalCount,
      },
      billingAgreement: isFreeTrial ? trialPlanBillingAgreement : paidPlanBillingAgreement,
      managementURL,
    };

    loggerServices.info({
      message: 'useGetApplePayRecurringPaymentRequest',
      recurringPaymentRequest,
    });

    setResult(recurringPaymentRequest);
  }, [plan, period, isFreeTrial, billingInfo.quantity, currentOrganization?._id]);

  return result;
}

export default useGetApplePayRecurringPaymentRequest;
