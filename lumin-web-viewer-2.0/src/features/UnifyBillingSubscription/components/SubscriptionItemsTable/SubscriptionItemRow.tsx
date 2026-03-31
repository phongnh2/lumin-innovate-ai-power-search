import { CaretDownIcon } from '@luminpdf/icons/dist/csr/CaretDown';
import { CaretUpIcon } from '@luminpdf/icons/dist/csr/CaretUp';
import { Badge, IconButton, Collapse, Divider, Icomoon, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import PDFProduct from 'assets/reskin/images/lumin-pdf-product.png';
import SignProduct from 'assets/reskin/images/lumin-sign-product.png';

import { useMobileMatch, useTranslation } from 'hooks';

import { paymentUtil, numberUtils } from 'utils';
import date from 'utils/date';
import { PaymentUtilities } from 'utils/Factory/Payment';
import { PaymentHelpers } from 'utils/payment';

import { useSubscriptionItemActions, useUnifyBillingSubscriptionStore } from 'features/UnifyBillingSubscription/hooks';

import { TOTAL_DOC_STACK_FREE_ORG } from 'constants/documentConstants';
import { UnifySubscriptionProduct } from 'constants/organization.enum';
import {
  PRODUCT_STATUS_LABEL_MAPPING,
  PRODUCT_TIER_LABEL_MAPPING,
  UNIFY_PRODUCTS_LABEL_MAPPING,
} from 'constants/organizationConstants';
import { PaymentPlans, PaymentStatus, PlanTypeLabel } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import mobileStyles from './SubscriptionItemRowMobile.module.scss';
import styles from './SubscriptionItemsTable.module.scss';

type SubscriptionItemRowProps = {
  type: string;
  subscriptionItem: SubScriptionItemWithAmount;
  organization: IOrganization;
  hasActiveSubscription: boolean;
  hasActiveSignSubscription: boolean;
};

const MapLogoByProduct = {
  [UnifySubscriptionProduct.PDF]: PDFProduct,
  [UnifySubscriptionProduct.SIGN]: SignProduct,
};

const SubscriptionItemRow = ({
  type,
  subscriptionItem,
  organization,
  hasActiveSubscription,
  hasActiveSignSubscription,
}: SubscriptionItemRowProps) => {
  const { t } = useTranslation();
  const isMobileMatch = useMobileMatch();

  const [expanded, setExpanded] = useState(false);

  const { upcomingInvoice } = useUnifyBillingSubscriptionStore();
  const { paymentStatus, paymentType, productName, currency, quantity, amount } = subscriptionItem;

  const paymentUtilities = new PaymentUtilities(organization.payment);
  const isEnterprise = paymentUtilities.isEnterprise();
  const isPdfFree = paymentUtilities.isPdfFree();

  const statusLabel = PRODUCT_STATUS_LABEL_MAPPING[paymentStatus];
  const tierLabel =
    isEnterprise && productName === UnifySubscriptionProduct.PDF
      ? PlanTypeLabel.ENTERPRISE
      : PRODUCT_TIER_LABEL_MAPPING[paymentType] || PlanTypeLabel.FREE;
  const isSignProduct = PaymentHelpers.isSignProduct(productName);

  const isFreeSubscription = (paymentType as string) === PaymentPlans.FREE;
  const isCanceled = paymentStatus === PaymentStatus.CANCELED;

  const currencySymbol = paymentUtil.convertCurrencySymbol(currency);
  const nextBilling =
    isFreeSubscription || isCanceled ? '-' : date.formatMDYTime((upcomingInvoice?.nextInvoice || 0) * 1000);
  const upcomingAmount =
    isFreeSubscription || isCanceled ? '-' : `${currencySymbol}${numberUtils.formatDecimal(amount / 100)}`;

  const {
    renderSubscriptionDetailsModal,
    renderActions,
    activeMenu,
    renderActiveSubscriptionModal,
    renderReactivateUnifySubscriptionModal,
  } = useSubscriptionItemActions({
    type,
    organization,
    subscriptionItem,
    hasActiveSignSubscription,
  });

  const getProductSubscriptionInfo = () => {
    if (isSignProduct) {
      return isFreeSubscription
        ? t('unifyBillingSettings.freeSignSubInfo', { amount: 5 })
        : t('unifyBillingSettings.signSubInfo', { amount: quantity, count: quantity });
    }
    if (isEnterprise) {
      return t('unifyBillingSettings.pdfEnterpriseSubInfo', {
        amount: organization.payment.quantity,
        count: organization.payment.quantity,
      });
    }
    if (isPdfFree) {
      return t('unifyBillingSettings.pdfSubInfo', {
        amount: TOTAL_DOC_STACK_FREE_ORG,
      });
    }
    return organization.docStackStorage
      ? t('unifyBillingSettings.pdfSubInfo', {
          amount: organization.docStackStorage?.totalStack,
        })
      : '-';
  };

  const renderModals = () =>
    [renderSubscriptionDetailsModal, renderActiveSubscriptionModal, renderReactivateUnifySubscriptionModal].map(
      (renderModal) => renderModal()
    );

  if (isMobileMatch) {
    return (
      <>
        <div className={mobileStyles.container} data-cy="product_item">
          <div className={mobileStyles.header} data-expanded={expanded}>
            <div className={mobileStyles.product}>
              <img className={styles.logo} src={MapLogoByProduct[productName]} alt="product" />
              <p className={styles.name}>{UNIFY_PRODUCTS_LABEL_MAPPING[productName]}</p>
              {statusLabel && (
                <Badge variant="other" size="md" className={styles.statusLabel} data-status={paymentStatus}>
                  {t(statusLabel)}
                </Badge>
              )}
            </div>
            <div className={mobileStyles.actionButton}>
              {renderActions()}
              <Divider orientation="vertical" h={16} w={1} color="var(--kiwi-colors-surface-outline-variant)" />
              <IconButton
                size="sm"
                onClick={() => setExpanded((prevState) => !prevState)}
                icon={expanded ? <CaretUpIcon width={16} height={16} /> : <CaretDownIcon width={16} height={16} />}
              />
            </div>
          </div>
          <Collapse in={expanded}>
            <div className={mobileStyles.content}>
              <div className={mobileStyles.contentRow}>
                <p className={mobileStyles.label}>{t('unifyBillingSettings.tier')}</p>
                <p className={mobileStyles.textInfo}>{tierLabel}</p>
              </div>
              <div className={mobileStyles.contentRow}>
                <p className={mobileStyles.label}>{t('unifyBillingSettings.productInfo')}</p>
                <p className={mobileStyles.textInfo}>{getProductSubscriptionInfo()}</p>
              </div>
              {hasActiveSubscription && (
                <>
                  <div className={mobileStyles.contentRow}>
                    <div className={mobileStyles.nextPriceContainer}>
                      <p className={mobileStyles.label}>{t('unifyBillingSettings.nextPrice')}</p>
                      <PlainTooltip eventTriggers={['touch']} content={t('unifyBillingSettings.priceTooltip')}>
                        <Icomoon type="ph-info" />
                      </PlainTooltip>
                    </div>
                    <p className={mobileStyles.textInfo}>{upcomingAmount}</p>
                  </div>
                  <div className={mobileStyles.contentRow}>
                    <p className={mobileStyles.label}>{t('unifyBillingSettings.nextBillDate')}</p>
                    <p className={mobileStyles.textInfo}>{nextBilling}</p>
                  </div>
                </>
              )}
            </div>
          </Collapse>
        </div>
        {renderModals()}
      </>
    );
  }

  return (
    <>
      <div
        className={styles.rowItem}
        data-payment-active={hasActiveSubscription}
        data-opened-menu={activeMenu === productName}
        data-cy="product_item"
      >
        <div className={styles.product}>
          <img className={styles.logo} src={MapLogoByProduct[productName]} alt="product" />
          <p className={styles.name}>{UNIFY_PRODUCTS_LABEL_MAPPING[productName]}</p>
          {statusLabel && (
            <Badge variant="other" size="md" className={styles.statusLabel} data-status={paymentStatus}>
              {t(statusLabel)}
            </Badge>
          )}
        </div>
        <p className={styles.extraInfoText}>{tierLabel}</p>
        <p className={styles.extraInfoText}>{getProductSubscriptionInfo()}</p>
        {hasActiveSubscription && (
          <>
            <p className={styles.extraInfoText}>{upcomingAmount}</p>
            <p className={styles.extraInfoText}>{nextBilling}</p>
          </>
        )}
        {renderActions()}
      </div>
      {renderModals()}
    </>
  );
};

export default SubscriptionItemRow;
