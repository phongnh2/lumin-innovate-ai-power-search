import React from 'react';

import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { PaymentCurrency, PaymentPlans } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

import SubscriptionHeaderInfo from './components/SubscriptionHeaderInfo';
import SubscriptionItemsTable from './components/SubscriptionItemsTable';
import { useUnifyBillingSubscriptionStore } from './hooks';

import styles from './UnifyBillingSubscriptionSection.module.scss';

type UnifyBillingSubscriptionSectionProps = {
  organization: IOrganization;
  type: string;
};

const UnifyBillingSubscriptionSection = ({ organization, type }: UnifyBillingSubscriptionSectionProps) => {
  const { subscription, upcomingInvoice } = useUnifyBillingSubscriptionStore();

  // As paymentType with value equal FREE from subscriptionItem is used for UI purpose
  // will add constant for this later
  const hasActiveSubscription = subscription.payment.subscriptionItems.some(
    (subItem) => (subItem.paymentType as string) !== PaymentPlans.FREE
  );
  const hasActiveSignSubscription = Boolean(
    subscription.payment.subscriptionItems.find(
      (subItem) => subItem.productName === UnifySubscriptionProduct.SIGN && Boolean(subItem.paymentStatus)
    )
  );

  return (
    <div className={styles.wrapper}>
      <SubscriptionHeaderInfo
        currency={subscription.payment.currency as PaymentCurrency}
        upcomingInvoice={upcomingInvoice}
      />
      <SubscriptionItemsTable
        type={type}
        organization={organization}
        hasActiveSubscription={hasActiveSubscription}
        hasActiveSignSubscription={hasActiveSignSubscription}
      />
    </div>
  );
};

export default React.memo(UnifyBillingSubscriptionSection);
