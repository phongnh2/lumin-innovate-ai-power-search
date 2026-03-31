import React, { useState } from 'react';

import { UnifySubscriptionProduct } from 'constants/organization.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { PaymentSubScriptionItem, SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import { ReactivateUnifySubscriptionModal } from '../components';

type UseReactivateUnifySubscriptionModalProps = {
  onReactivate: (payload: Pick<PaymentSubScriptionItem, 'productName'>[]) => void;
  organization: IOrganization;
  productToReactivate: UnifySubscriptionProduct;
  subscriptionItems: SubScriptionItemWithAmount[];
};

const useReactivateUnifySubscriptionModal = ({
  onReactivate,
  organization,
  productToReactivate,
  subscriptionItems,
}: UseReactivateUnifySubscriptionModalProps) => {
  const [opened, setOpened] = useState(false);

  const render = () =>
    opened && (
      <ReactivateUnifySubscriptionModal
        onClose={() => setOpened(false)}
        onConfirm={onReactivate}
        organization={organization}
        productToReactivate={productToReactivate}
        subscriptionItems={subscriptionItems}
      />
    );

  return {
    render,
    toggle: () => setOpened((prevState) => !prevState),
  };
};

export default useReactivateUnifySubscriptionModal;
