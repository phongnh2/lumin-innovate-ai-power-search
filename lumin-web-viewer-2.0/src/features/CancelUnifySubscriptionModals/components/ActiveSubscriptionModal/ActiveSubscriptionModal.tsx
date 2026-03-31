import { Modal, Checkbox } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { paymentUtil, numberUtils } from 'utils';
import date from 'utils/date';
import { getRedirectOrgUrl } from 'utils/orgUrlUtils';

import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { PRODUCT_TIER_LABEL_MAPPING, UNIFY_PRODUCTS_LABEL_MAPPING } from 'constants/organizationConstants';
import { PlanTypeLabel, PaymentPlans } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import styles from './ActiveSubscriptionModal.module.scss';

type ActiveSubscriptionModalProps = {
  onClose: () => void;
  nextInvoice: number;
  organization: IOrganization;
  productToCancel: SubScriptionItemWithAmount;
  subscriptionItems: SubScriptionItemWithAmount[];
};

const ActiveSubscriptionModal = ({
  onClose,
  nextInvoice,
  organization,
  productToCancel,
  subscriptionItems,
}: ActiveSubscriptionModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedSubscriptionItems, setSelectedSubscriptionItems] = useState<SubScriptionItemWithAmount[]>([
    productToCancel,
  ]);

  const { onKeyDown } = useKeyboardAccessibility();

  const nextBillDate = date.formatMDYTime((nextInvoice || 0) * 1000);

  const handleNavigateToSurveyProcess = () => {
    const products = selectedSubscriptionItems.map((product) => product.productName.toLowerCase()).join(',');
    const url = getRedirectOrgUrl({
      orgUrl: organization.url,
      path: '/subscription/survey',
      search: `?product=${products}`,
    });
    navigate(url);
  };

  const getSubscriptionItemInfo = (subscriptionItem: SubScriptionItemWithAmount) => {
    const { payment } = organization;
    const { amount, productName, paymentType, quantity, currency } = subscriptionItem;
    const isEnterprise = payment.type === PaymentPlans.ENTERPRISE;
    const currencySymbol = paymentUtil.convertCurrencySymbol(currency);
    const upcomingAmount = `${currencySymbol}${numberUtils.formatDecimal(amount / 100)}`;
    const base = {
      upcomingAmount,
      plan:
        isEnterprise && productName === UnifySubscriptionProduct.PDF
          ? PlanTypeLabel.ENTERPRISE
          : PRODUCT_TIER_LABEL_MAPPING[paymentType],
    };
    const info = {
      [UnifySubscriptionProduct.PDF]: isEnterprise
        ? t('unifyBillingSettings.pdfEnterpriseSubInfo', {
            amount: payment.quantity,
            count: payment.quantity,
          })
        : `${organization.docStackStorage?.totalStack || 0} ${t('common.documents')}`,
      [UnifySubscriptionProduct.SIGN]: `${quantity} ${t(quantity > 1 ? 'seats_label' : 'seat_label', { ns: 'terms' })}`,
    }[productName];
    return {
      ...base,
      info,
    };
  };

  return (
    <Modal
      centered
      opened
      size="sm"
      onClose={onClose}
      type="warning"
      title={t('cancelUnifySubscriptionModals.cancelTitle')}
      cancelButtonProps={{
        title: t('cancelUnifySubscriptionModals.keepSubscription'),
        'data-cy': 'keep_subscription_button',
      }}
      onCancel={onClose}
      confirmButtonProps={{
        title: t('cancelUnifySubscriptionModals.continueToCancel'),
        disabled: !selectedSubscriptionItems.length,
        'data-cy': 'continue_to_cancel_button',
      }}
      onConfirm={handleNavigateToSurveyProcess}
    >
      <div className={styles.contentWrapper}>
        <p className={styles.description}>
          <Trans
            i18nKey="cancelUnifySubscriptionModals.activeSubDescription"
            components={{
              b: <b className="kiwi-message--primary" />,
            }}
            values={{
              nextBillDate,
            }}
          />
        </p>
        {subscriptionItems.map((subscriptionItem) => {
          const { upcomingAmount, plan, info } = getSubscriptionItemInfo(subscriptionItem);
          const isSelected = selectedSubscriptionItems.some(
            (item) => item.productName === subscriptionItem.productName
          );
          const handleCheck = () => {
            if (!isSelected) {
              setSelectedSubscriptionItems([...selectedSubscriptionItems, subscriptionItem]);
            } else {
              setSelectedSubscriptionItems(
                selectedSubscriptionItems.filter((item) => item.productName !== subscriptionItem.productName)
              );
            }
          };
          return (
            <div
              key={subscriptionItem.productName}
              role="button"
              tabIndex={0}
              onClick={handleCheck}
              onKeyDown={onKeyDown}
              className={styles.subscriptionItem}
              data-selected={isSelected}
              data-cy={`subscription_item_${subscriptionItem.productName.toLowerCase()}`}
            >
              <div className={styles.productInfo}>
                <p className={styles.productName}>Lumin {UNIFY_PRODUCTS_LABEL_MAPPING[subscriptionItem.productName]}</p>
                <p className={styles.productSubInfo}>
                  {plan} - {info} - {upcomingAmount}
                </p>
              </div>
              <Checkbox
                tabIndex={-1}
                className={styles.checkbox}
                checked={isSelected}
                onChange={() => {}}
                data-cy={`subscription_item_checkbox_${subscriptionItem.productName.toLowerCase()}`}
              />
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default ActiveSubscriptionModal;
