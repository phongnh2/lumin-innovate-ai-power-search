import React from 'react';

import { PaymentTypes } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { GetUnifySubscriptionData, SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';
import { IUser } from 'interfaces/user/user.interface';

import OrgBillingDetail from './components/OrgBillingDetail';
import PersonalBillingDetail from './PersonalBillingDetail';

type Props = {
  entity: IOrganization | IUser;
  paymentType: string;
  currentOrganization?: IOrganization;
  subscriptionItem?: SubScriptionItemWithAmount;
  subscription: GetUnifySubscriptionData['subscription'];
  upcomingInvoice: GetUnifySubscriptionData['upcomingInvoice'];
  setUnifyBillingSubscriptionData: (payload: GetUnifySubscriptionData) => void;
};

const BillingDetailContainer = ({
  entity,
  paymentType,
  currentOrganization,
  subscriptionItem,
  subscription,
  upcomingInvoice,
  setUnifyBillingSubscriptionData,
}: Props) => {
  if (paymentType === PaymentTypes.INDIVIDUAL) {
    return (
      <PersonalBillingDetail subscription={subscription} upcomingInvoice={upcomingInvoice} user={entity as IUser} />
    );
  }
  return (
    <OrgBillingDetail
      subscriptionItem={subscriptionItem}
      subscription={subscription}
      upcomingInvoice={upcomingInvoice}
      organization={entity as IOrganization}
      currentOrganization={currentOrganization}
      setUnifyBillingSubscriptionData={setUnifyBillingSubscriptionData}
    />
  );
};

export default BillingDetailContainer;
