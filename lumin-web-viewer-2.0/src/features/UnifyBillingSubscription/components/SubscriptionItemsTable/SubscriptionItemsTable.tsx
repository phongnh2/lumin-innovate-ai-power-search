import { Divider, PlainTooltip, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { Fragment } from 'react';

import { useMobileMatch, useTranslation } from 'hooks';

import { useUnifyBillingSubscriptionStore } from 'features/UnifyBillingSubscription/hooks';

import { IOrganization } from 'interfaces/organization/organization.interface';

import SubscriptionItemRow from './SubscriptionItemRow';

import styles from './SubscriptionItemsTable.module.scss';

type SubscriptionItemsTableProps = {
  type: string;
  organization: IOrganization;
  hasActiveSubscription: boolean;
  hasActiveSignSubscription: boolean;
};

const SubscriptionItemsTable = ({
  type,
  organization,
  hasActiveSubscription,
  hasActiveSignSubscription,
}: SubscriptionItemsTableProps) => {
  const { t } = useTranslation();
  const isMobileMatch = useMobileMatch();

  const { subscription } = useUnifyBillingSubscriptionStore();
  const { payment } = subscription;

  const renderItems = () =>
    payment.subscriptionItems.map((subItem, index) => (
      <Fragment key={subItem.productName}>
        <SubscriptionItemRow
          type={type}
          organization={organization}
          subscriptionItem={subItem}
          hasActiveSignSubscription={hasActiveSignSubscription}
          hasActiveSubscription={hasActiveSubscription}
        />
        {!isMobileMatch && index % 2 === 0 && (
          <Divider w="100%" color="var(--kiwi-colors-surface-surface-container-high)" />
        )}
      </Fragment>
    ));

  if (isMobileMatch) {
    return <div className={styles.mobileContainer}>{renderItems()}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header} data-payment-active={hasActiveSubscription}>
        <p className={styles.label}>{t('unifyBillingSettings.product')}</p>
        <p className={styles.label}>{t('unifyBillingSettings.tier')}</p>
        <p className={styles.label}>{t('unifyBillingSettings.info')}</p>
        {hasActiveSubscription && (
          <>
            <div className={`${styles.nextPriceContainer} ${styles.label}`}>
              <p>{t('unifyBillingSettings.nextPrice')}</p>
              <PlainTooltip eventTriggers={['touch']} content={t('unifyBillingSettings.priceTooltip')}>
                <Icomoon type="ph-info" />
              </PlainTooltip>
            </div>
            <p className={styles.label}>{t('unifyBillingSettings.nextBillDate')}</p>
          </>
        )}
        <p className={styles.label}>{t('unifyBillingSettings.action')}</p>
      </div>
      <div className={styles.body}>{renderItems()}</div>
    </div>
  );
};

export default SubscriptionItemsTable;
