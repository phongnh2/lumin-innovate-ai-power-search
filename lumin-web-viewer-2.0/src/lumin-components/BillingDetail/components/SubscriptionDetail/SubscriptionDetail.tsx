import React from 'react';

import { OLD_BUSINESS_PLANS, PERSONAL_PLANS, PREMIUM_PLANS } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { GetUnifySubscriptionData, SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';
import { IUser } from 'interfaces/user/user.interface';

import PersonalSubscription from './PersonalSubscription';
import PremiumSubscription from './PremiumSubscription';

import styles from './SubscriptionDetail.module.scss';

type Props = {
  entity: IOrganization | IUser;
  reactivateSubscription: () => void;
  subscriptionItem?: SubScriptionItemWithAmount;
  upcomingInvoice: GetUnifySubscriptionData['upcomingInvoice'];
  subscription: GetUnifySubscriptionData['subscription'];
};

function SubscriptionDetail({
  entity,
  reactivateSubscription,
  upcomingInvoice,
  subscription,
  subscriptionItem = {} as SubScriptionItemWithAmount,
}: Props): JSX.Element {
  const { payment } = entity;
  const { paymentType } = subscriptionItem;

  const renderDetail = (): JSX.Element => {
    if (PREMIUM_PLANS.includes(paymentType) || OLD_BUSINESS_PLANS.includes(payment.type)) {
      return (
        <PremiumSubscription
          subscriptionItem={subscriptionItem}
          subscription={subscription}
          upcomingInvoice={upcomingInvoice}
          organization={entity as IOrganization}
          reactivateSubscription={reactivateSubscription}
        />
      );
    }
    if (PERSONAL_PLANS.includes(payment.type) || PERSONAL_PLANS.includes(paymentType)) {
      return (
        <PersonalSubscription subscription={subscription} upcomingInvoice={upcomingInvoice} user={entity as IUser} />
      );
    }
    return null;
  };

  return <div className={styles.container}>{renderDetail()}</div>;
}

export default SubscriptionDetail;
