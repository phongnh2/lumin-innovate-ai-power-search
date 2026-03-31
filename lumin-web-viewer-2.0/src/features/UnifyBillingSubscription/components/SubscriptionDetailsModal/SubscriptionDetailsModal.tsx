import { Dialog } from 'lumin-ui/kiwi-ui';
import React from 'react';

import OrgBillingDetail from 'luminComponents/BillingDetail/components/OrgBillingDetail';

import { useMobileMatch, useTranslation } from 'hooks';

import { UNIFY_PRODUCTS_LABEL_MAPPING } from 'constants/organizationConstants';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { GetUnifySubscriptionData, SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import styles from './SubscriptionDetailsModal.module.scss';

type SubscriptionDetailsModalProps = {
  onClose: () => void;
  organization: IOrganization;
  subscriptionItem: SubScriptionItemWithAmount;
  subscription: GetUnifySubscriptionData['subscription'];
  upcomingInvoice: GetUnifySubscriptionData['upcomingInvoice'];
  setUnifyBillingSubscriptionData: (payload: GetUnifySubscriptionData) => void;
};

const SubscriptionDetailsModal = ({
  organization,
  subscriptionItem,
  subscription,
  upcomingInvoice,
  onClose,
  setUnifyBillingSubscriptionData,
}: SubscriptionDetailsModalProps) => {
  const { t } = useTranslation();
  const isMobileMatch = useMobileMatch();

  const { productName } = subscriptionItem;

  const mobileProps = isMobileMatch
    ? {
        classNames: {
          inner: styles.inner,
          body: styles.body,
        },
        headerTitleContainerProps: {
          className: styles.header,
        },
        closeButtonProps: {
          className: styles.closeButton,
        },
        fullScreen: true,
      }
    : {
        headerTitleContainerProps: {
          className: styles.headerTitle,
        },
      };

  return (
    <Dialog
      opened
      centered
      size="lg"
      withCloseButton
      headerTitle={t('unifyBillingSettings.productSubscriptionDetails', { productName: UNIFY_PRODUCTS_LABEL_MAPPING[productName] })}
      onClose={onClose}
      {...mobileProps}
    >
      <div className={styles.content} data-mobile={isMobileMatch}>
        <OrgBillingDetail
          organization={organization}
          currentOrganization={organization}
          subscriptionItem={subscriptionItem}
          subscription={subscription}
          upcomingInvoice={upcomingInvoice}
          setUnifyBillingSubscriptionData={setUnifyBillingSubscriptionData}
        />
      </div>
    </Dialog>
  );
};

export default SubscriptionDetailsModal;
