/* eslint-disable import/no-cycle */
import { Divider, Paper, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import PaymentEncryptedCert from 'lumin-components/PaymentEncryptedCert';
import StripePaymentForm from 'luminComponents/StripePaymentForm';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IPaymentMethod } from 'interfaces/payment/payment.interface';

import OrganizationInfo from './components/OrganizationInfo';
import { BillingInfo, PeriodType, PlanType } from '../OrganizationCheckout/OrganizationCheckoutContext';
import PeriodSwitch from '../PeriodSwitch';
import PlanSwitch from '../PlanSwitch';

import styles from './CheckoutForm.module.scss';

type Props = {
  billingInfo: BillingInfo;
  changeBillingInfo: (field: string, value: unknown, isUserChange?: boolean) => void;
  canUpgrade: boolean;
  currentOrganization: IOrganization;
  currentPaymentMethod: IPaymentMethod;
  isLoading: boolean;
  hidePromote: boolean;
  period: string;
  periodList: PeriodType[];
  onPeriodChange: (_period: string) => void;
  plan: string;
  planList: PlanType[];
  onPlanChange: ({ _plan, _trial }: { _plan: string; _trial: boolean }) => void;
};

const CheckoutForm = ({
  billingInfo,
  changeBillingInfo,
  canUpgrade,
  currentOrganization,
  currentPaymentMethod,
  isLoading,
  period,
  onPeriodChange,
  hidePromote,
  periodList,
  plan,
  planList,
  onPlanChange,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Paper elevation="lg" className={styles.container}>
      <div className={styles.paymentForm}>
        <OrganizationInfo currentOrganization={currentOrganization} />
        <div className={styles.paymentDetail}>
          <div className={styles.periodContainer}>
            <Text type="headline" size="md">
              {t('plan.title')}
            </Text>
            <PeriodSwitch periodList={periodList} period={period} onChange={onPeriodChange} />
          </div>
          <div>
            <PlanSwitch
              planList={planList}
              plan={plan}
              onChange={onPlanChange}
              period={period}
              currency={billingInfo.currency}
            />
          </div>
          <Divider className={styles.divider} />
          <StripePaymentForm
            billingInfo={billingInfo}
            changeBillingInfo={changeBillingInfo}
            currentPaymentMethod={currentPaymentMethod}
            isLoadingCardInfo={isLoading}
            canUpgrade={canUpgrade}
            currentOrganization={currentOrganization}
            hidePromote={hidePromote}
          />
        </div>
      </div>
      <PaymentEncryptedCert />
    </Paper>
  );
};

export default React.memo(CheckoutForm);
