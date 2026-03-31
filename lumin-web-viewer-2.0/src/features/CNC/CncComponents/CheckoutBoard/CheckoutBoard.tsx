import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { compose } from 'redux';

import TrackedForm from 'lumin-components/Shared/TrackedForm';

import withGetPaymentInfo from 'HOC/withGetPaymentInfo';
import withStripeElements from 'HOC/withStripeElements';

import {
  useGetCurrencyBaseOnLocation,
  useMatchPaymentRoute,
  useOrganizationPayment,
  usePaymentPermissions,
  useTranslation,
} from 'hooks';
import useGetNextPaymentInfo from 'hooks/useGetNextPaymentInfo';

import { COMMON_FORM_INFO } from 'utils/Factory/EventCollection/FormEventCollection';
import { PaymentUrlSerializer } from 'utils/payment';

import { LocalStorageKey } from 'constants/localStorageKey';
import { CURRENCY } from 'constants/paymentConstant';
import { Routers } from 'constants/Routers';

import { ICustomerInfo, IPaymentMethod } from 'interfaces/payment/payment.interface';

import { getRadioButtons, getPlanRadioButtons } from './helpers/getRadioButtons';
import CheckoutForm from '../CheckoutForm';
import CheckoutTempBilling from '../CheckoutTempBilling/CheckoutTempBilling';
import { BillingInfo } from '../OrganizationCheckout/OrganizationCheckoutContext';

import styles from './CheckoutBoard.module.scss';

type Props = {
  isChangeCard: boolean;
  isFetchedCard: boolean;
  billingInfo: BillingInfo;
  setBillingInfo: React.Dispatch<React.SetStateAction<BillingInfo>>;
  currentPaymentMethod: IPaymentMethod;
  isLoading: boolean;
  customerInfo: ICustomerInfo;
  stripeAccountId?: string;
  getNewSecret?: () => void;
};

function CheckoutBoard({
  stripeAccountId,
  isChangeCard,
  currentPaymentMethod,
  isLoading,
  customerInfo,
  isFetchedCard,
  billingInfo,
  setBillingInfo,
  getNewSecret,
}: Props): React.JSX.Element {
  const { plan, period, search, trial } = useMatchPaymentRoute();
  const isTrial = trial === 'true';
  const [isCardExisted, setIsCardExisted] = useState(false);
  const { currentOrganization } = useOrganizationPayment({ billingInfo });
  const { canUpgrade, clientId } = usePaymentPermissions({
    currentOrganization,
    billingInfo,
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locationCurrency, loading: isFetchingCurrency } = useGetCurrencyBaseOnLocation();
  const periodList = getRadioButtons({ t });
  const planList = getPlanRadioButtons({ t, _plan: plan, _trial: trial });

  const onPeriodChange = (_period: string) => {
    const paymentUrlSerializer = new PaymentUrlSerializer()
      .trial(false)
      .checkout(Routers.CHECKOUT)
      .period(_period)
      .plan(plan)
      .trialParam(isTrial)
      .searchParam(search);
    navigate(paymentUrlSerializer.get(), { replace: true });
  };

  const onPlanChange = ({ _plan, _trial }: { _plan: string; _trial: boolean }) => {
    const paymentUrlSerializer = new PaymentUrlSerializer()
      .trial(false)
      .checkout(Routers.CHECKOUT)
      .period(period)
      .plan(_plan)
      .trialParam(_trial)
      .searchParam(search);
    navigate(paymentUrlSerializer.get(), { replace: true });
  };

  const { formName, formPurpose } = COMMON_FORM_INFO.upgradePlan;

  const changeBillingInfo = useCallback((field: string, value: unknown) => {
    setBillingInfo((_billingInfo) => ({
      ..._billingInfo,
      [field]: value,
    }));
  }, []);

  useGetNextPaymentInfo({
    plan,
    period,
    currency: billingInfo.currency,
    stripeAccountId,
    organizationId: billingInfo.organizationId,
    isFetchedCard,
    currentPaymentMethod,
  });

  useEffect(() => {
    changeBillingInfo('stripeAccountId', stripeAccountId);
    const isStripeLimitCurrency = stripeAccountId === process.env.STRIPE_US_ACCOUNT_ID;
    if (isStripeLimitCurrency) {
      localStorage.setItem(LocalStorageKey.CURRENCY, CURRENCY.USD.value);
      changeBillingInfo('currency', CURRENCY.USD.value);
    }
    setIsCardExisted(Boolean(currentPaymentMethod));
  }, [currentPaymentMethod, changeBillingInfo, clientId, stripeAccountId]);

  useEffect(() => {
    const isStripeLimitCurrency = stripeAccountId === process.env.STRIPE_US_ACCOUNT_ID;
    if (!isStripeLimitCurrency) {
      changeBillingInfo('currency', customerInfo?.currency || locationCurrency || CURRENCY.USD.value);
    }
  }, [customerInfo?.currency, locationCurrency]);

  return (
    <TrackedForm formName={formName} formPurpose={formPurpose} className="" onSubmit={() => {}} onReset={() => {}}>
      <div className={styles.container}>
        <div>
          <CheckoutForm
            changeBillingInfo={changeBillingInfo}
            billingInfo={billingInfo}
            canUpgrade={canUpgrade}
            currentOrganization={currentOrganization}
            currentPaymentMethod={currentPaymentMethod}
            period={period}
            periodList={periodList}
            onPeriodChange={onPeriodChange}
            plan={plan}
            planList={planList}
            onPlanChange={onPlanChange}
            hidePromote={isTrial}
            isLoading={isLoading || isFetchingCurrency}
          />
        </div>
        <CheckoutTempBilling
          billingInfo={billingInfo}
          isChangeCard={isChangeCard}
          canUpgrade={canUpgrade}
          currentOrganization={currentOrganization}
          isCardExisted={isCardExisted}
          isLoading={isLoading || isFetchingCurrency}
          isFetchedCard={isFetchedCard}
          clientId={clientId}
          getNewSecret={getNewSecret}
        />
      </div>
    </TrackedForm>
  );
}

export default compose(
  withGetPaymentInfo,
  React.memo
)(withStripeElements(CheckoutBoard, { action: 'payment' })) as React.ComponentType<Props>;
