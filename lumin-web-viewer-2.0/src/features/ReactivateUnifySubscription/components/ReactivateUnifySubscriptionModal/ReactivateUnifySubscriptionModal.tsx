import { Modal, Checkbox } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import { useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { paymentUtil, numberUtils } from 'utils';

import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { PRODUCT_TIER_LABEL_MAPPING, UNIFY_PRODUCTS_LABEL_MAPPING } from 'constants/organizationConstants';
import { PaymentPlans, PlanTypeLabel } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { PaymentSubScriptionItem, SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import styles from './ReactivateUnifySubscriptionModal.module.scss';

type ReactivateUnifySubscriptionModalProps = {
  onClose: VoidFunction;
  onConfirm: (payload: Pick<PaymentSubScriptionItem, 'productName'>[]) => void;
  organization: IOrganization;
  subscriptionItems: SubScriptionItemWithAmount[];
  productToReactivate: UnifySubscriptionProduct;
};

const ReactivateUnifySubscriptionModal = ({
  onClose,
  onConfirm,
  organization,
  subscriptionItems,
  productToReactivate,
}: ReactivateUnifySubscriptionModalProps) => {
  const { t } = useTranslation();

  const [selectedProducts, setSelectedProducts] = useState<SubScriptionItemWithAmount[]>(() =>
    subscriptionItems.filter((subItem) => subItem.productName === productToReactivate)
  );
  const { onKeyDown } = useKeyboardAccessibility();

  const getInfoDetails = (subscriptionItem: SubScriptionItemWithAmount) => {
    const { payment } = organization;
    const { productName, paymentType, quantity, amount, currency } = subscriptionItem;
    const isEnterprise = payment.type === PaymentPlans.ENTERPRISE;
    const currencySymbol = paymentUtil.convertCurrencySymbol(currency);
    const upcomingAmount = `${currencySymbol}${numberUtils.formatDecimal(amount / 100)}`;
    const details = {
      upcomingAmount,
      plan:
        isEnterprise && productName === UnifySubscriptionProduct.PDF
          ? PlanTypeLabel.ENTERPRISE
          : PRODUCT_TIER_LABEL_MAPPING[paymentType],
    };
    const info = {
      [UnifySubscriptionProduct.SIGN]: `${quantity} ${t('seats_label', { ns: 'terms' })}`,
      [UnifySubscriptionProduct.PDF]: isEnterprise
        ? t('unifyBillingSettings.pdfEnterpriseSubInfo', {
            amount: payment.quantity,
            count: payment.quantity,
          })
        : `${organization.docStackStorage?.totalStack || 0} ${t('common.documents')}`,
    }[productName];
    return {
      ...details,
      info,
    };
  };

  return (
    <Modal
      opened
      centered
      size="sm"
      onClose={onClose}
      type="warning"
      title={t('reactivateUnifySubscriptionModal.title')}
      cancelButtonProps={{
        title: t('common.cancel'),
        'data-cy': 'cancel_button',
      }}
      onCancel={onClose}
      confirmButtonProps={{
        title: t('common.reactivate'),
        disabled: !selectedProducts.length,
        'data-cy': 'reactivate_button',
      }}
      onConfirm={() =>
        onConfirm(selectedProducts.map((subscriptionItem) => ({ productName: subscriptionItem.productName })))
      }
    >
      <div className={styles.contentWrapper}>
        <p className={styles.description}>{t('reactivateUnifySubscriptionModal.content')}</p>
        {subscriptionItems.map((subscriptionItem) => {
          const { productName } = subscriptionItem;
          const { plan, info, upcomingAmount } = getInfoDetails(subscriptionItem);
          const isSelected = selectedProducts.some((item) => item.productName === productName);
          const onItemCheck = () => {
            if (isSelected) {
              setSelectedProducts((prevState) => prevState.filter((item) => item.productName !== productName));
            } else {
              setSelectedProducts((prevState) => [...prevState, subscriptionItem]);
            }
          };
          return (
            <div
              key={productName}
              role="button"
              tabIndex={0}
              data-selected={isSelected}
              onClick={onItemCheck}
              onKeyDown={onKeyDown}
              className={styles.subscriptionItem}
              data-cy={`subscription_item_${productName.toLowerCase()}`}
            >
              <div className={styles.productInfo}>
                <p className={styles.productName}>Lumin {UNIFY_PRODUCTS_LABEL_MAPPING[productName]}</p>
                <p className={styles.productSubInfo}>
                  {plan} - {info} - {upcomingAmount}
                </p>
              </div>
              <Checkbox
                tabIndex={-1}
                className={styles.checkbox}
                checked={isSelected}
                data-cy={`subscription_item_checkbox_${productName.toLowerCase()}`}
              />
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default ReactivateUnifySubscriptionModal;
