import { Divider, Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useMobileMatch, useTranslation } from 'hooks';

import wrapperStyles from '../../UnifyBillingSubscriptionSection.module.scss';
import headerStyles from '../SubscriptionHeaderInfo/SubscriptionHeaderInfo.module.scss';
import tableStyles from '../SubscriptionItemsTable/SubscriptionItemsTable.module.scss';

import mobileStyles from './UnifyBillingSubscriptionSkeleton.module.scss';

const UnifyBillingSubscriptionSkeleton = () => {
  const { t } = useTranslation();
  const isMobileMatch = useMobileMatch();

  if (isMobileMatch) {
    return (
      <div className={mobileStyles.container}>
        <div className={headerStyles.container}>
          <h3 className={headerStyles.header}>{t('unifyBillingSettings.subscription')}</h3>
          <Skeleton radius="sm" width={200} height={16} />
        </div>
        <div className={mobileStyles.productItem}>
          <div className={mobileStyles.productInfo}>
            <Skeleton radius="sm" width={24} height={24} />
            <Skeleton radius="sm" width={100} height={16} />
          </div>
          <Skeleton radius="sm" width={60} height={16} />
        </div>
        <div className={mobileStyles.productItem}>
          <div className={mobileStyles.productInfo}>
            <Skeleton radius="sm" width={24} height={24} />
            <Skeleton radius="sm" width={100} height={16} />
          </div>
          <Skeleton radius="sm" width={60} height={16} />
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperStyles.wrapper}>
      <div className={headerStyles.container}>
        <h3 className={headerStyles.header}>{t('unifyBillingSettings.subscription')}</h3>
        <Skeleton radius="sm" width={500} height={16} />
      </div>
      <div className={tableStyles.container}>
        <div className={tableStyles.header} data-payment-active="false">
          <Skeleton radius="sm" width={60} height={16} />
          <Skeleton radius="sm" width={40} height={16} />
          <Skeleton radius="sm" width={40} height={16} />
          <Skeleton radius="sm" width={50} height={16} />
        </div>
        <div className={tableStyles.body}>
          <div className={tableStyles.rowItem} data-payment-active="false">
            <div className={tableStyles.product}>
              <Skeleton radius="sm" width={24} height={24} />
              <Skeleton radius="sm" width={100} height={16} />
            </div>
            <Skeleton radius="sm" width={60} height={16} />
            <Skeleton radius="sm" width={140} height={16} />
            <Skeleton radius="sm" width={60} height={16} />
          </div>
          <Divider w="100%" color="var(--kiwi-colors-surface-surface-container-high)" />
          <div className={tableStyles.rowItem} data-payment-active="false">
            <div className={tableStyles.product}>
              <Skeleton radius="sm" width={24} height={24} />
              <Skeleton radius="sm" width={100} height={16} />
            </div>
            <Skeleton radius="sm" width={60} height={16} />
            <Skeleton radius="sm" width={140} height={16} />
            <Skeleton radius="sm" width={60} height={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifyBillingSubscriptionSkeleton;
