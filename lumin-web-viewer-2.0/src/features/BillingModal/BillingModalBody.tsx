import React from 'react';

import useGetNextPaymentInfo from 'hooks/useGetNextPaymentInfo';

import { useTrialModalContext } from 'features/BillingModal/hooks/useTrialModalContext';

import BillingForm from './components/BillingForm';
import BillingSummary from './components/BillingSummary';

import styles from './BillingModal.module.scss';

const BillingModalBody = ({ closeModal }: { closeModal: () => void }) => {
  const { isFetchedCard, currentPaymentMethod, billingInfo } = useTrialModalContext();

  useGetNextPaymentInfo({
    plan: billingInfo.plan,
    period: billingInfo.period,
    currency: billingInfo.currency,
    stripeAccountId: billingInfo.stripeAccountId,
    organizationId: billingInfo.organizationId,
    isFetchedCard,
    currentPaymentMethod,
  });

  return (
    <div className={styles.dialogBody}>
      <BillingForm />
      <BillingSummary closeModal={closeModal} />
    </div>
  );
};

export default BillingModalBody;
