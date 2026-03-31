import { Divider } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { GetUnifySubscriptionData } from 'interfaces/payment/payment.interface';
import { IUser } from 'interfaces/user/user.interface';

import EnterpriseOrgOffer from './components/EnterpriseOrgOffer';
import styles from './components/OrgBillingDetail/OrgBillingDetail.module.scss';
import SubscriptionDetail from './components/SubscriptionDetail';
import SubscriptionSummary from './components/SubscriptionSummary';

type Props = {
  user: IUser;
  subscription: GetUnifySubscriptionData['subscription'];
  upcomingInvoice: GetUnifySubscriptionData['upcomingInvoice'];
};

function PersonalBillingDetail({ user, upcomingInvoice, subscription }: Props): JSX.Element {
  const { name, avatarRemoteId, payment } = user;
  return (
    <div>
      <div className={styles.container}>
        <SubscriptionSummary name={name} payment={payment} avatarRemoteId={avatarRemoteId} />
        <EnterpriseOrgOffer payment={payment} />
        <Divider />
        <SubscriptionDetail subscription={subscription} upcomingInvoice={upcomingInvoice} entity={user} />
      </div>
    </div>
  );
}

export default PersonalBillingDetail;
