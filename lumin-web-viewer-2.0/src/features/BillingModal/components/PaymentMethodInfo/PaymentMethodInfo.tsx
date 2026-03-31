import { InfoIcon } from '@luminpdf/icons/dist/csr/Info';
import { Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';

import ApplePaymentMethodIcon from 'assets/lumin-svgs/apple-payment-method.svg';
import CashappPaymentMethod from 'assets/lumin-svgs/cashapp-payment-method.svg';
import GooglePaymentMethodIcon from 'assets/lumin-svgs/google-payment-method.svg';
import LinkPaymentMethod from 'assets/lumin-svgs/link-payment-method.svg';

import CurrencyPicker from 'luminComponents/StripePaymentForm/components/CurrencyPicker';

import { useTranslation } from 'hooks/useTranslation';

import { CheckoutModalContext } from 'features/CNC/CncComponents/CheckoutModal/context/CheckoutModalContext';
import { CHECKOUT_ON_VIEWER_VARIANT } from 'features/CNC/hooks/useOpenCheckoutOnViewer';

import { CardWallet, PaymentMethodTypeEnums } from 'constants/plan.enum';
import { Routers } from 'constants/Routers';

import { IPaymentMethod } from 'interfaces/payment/payment.interface';

import styles from './PaymentMethodInfo.module.scss';

const WalletIconMapping = {
  [CardWallet.APPLE_PAY]: ApplePaymentMethodIcon,
  [CardWallet.GOOGLE_PAY]: GooglePaymentMethodIcon,
};

const altWalletNameMapping = {
  [CardWallet.APPLE_PAY]: 'Apple Pay',
  [CardWallet.GOOGLE_PAY]: 'Google Pay',
};
export interface PaymentMethodInfoProps {
  paymentMethod: IPaymentMethod;
  from?: CHECKOUT_ON_VIEWER_VARIANT;
  orgUrl?: string;
}

const PaymentMethodInfo = ({
  paymentMethod,
  orgUrl,
  from = CHECKOUT_ON_VIEWER_VARIANT.POPOVER,
}: PaymentMethodInfoProps) => {
  const { t } = useTranslation();
  const isFromCheckoutModal = from === CHECKOUT_ON_VIEWER_VARIANT.MODAL;
  const { billingInfo } = useContext(CheckoutModalContext);

  const billingSettingUrl = useMemo(() => {
    const pathName = [Routers.ORGANIZATION, orgUrl, 'dashboard/billing'].join('/');
    const hashParam = '#billing-info';
    return `${pathName}${hashParam}`;
  }, [orgUrl]);

  const contentForm = useMemo((): { value: string; leftElement?: React.ReactNode } => {
    const { type, card, link, cashapp } = paymentMethod;
    switch (type) {
      case PaymentMethodTypeEnums.LINK:
        return {
          value: link?.email || '',
          leftElement: <img src={LinkPaymentMethod} alt="Link payment method" />,
        };
      case PaymentMethodTypeEnums.CASHAPP:
        return {
          value: cashapp?.email || '',
          leftElement: <img src={CashappPaymentMethod} alt="Cash App payment method" className={styles.cashappIcon} />,
        };
      case PaymentMethodTypeEnums.CARD:
      default:
        return {
          value: ['**** **** ****', card?.last4].join(' '),
          leftElement: WalletIconMapping[card.wallet] ? (
            <img
              src={WalletIconMapping[card.wallet]}
              className={styles.walletIcon}
              alt={`${altWalletNameMapping[card.wallet]} payment method`}
            />
          ) : (
            <Icomoon size="md" type="ph-credit-card-fill" color="var(--kiwi-colors-surface-on-surface)" />
          ),
        };
    }
  }, [paymentMethod]);

  return (
    <div className={styles.container}>
      {isFromCheckoutModal && (
        <div className={styles.infoContainer}>
          <InfoIcon weight="regular" size={16} />
          <Text type="label" size="sm" color="var(--kiwi-colors-support-green-foreground-high)">
            {t('checkoutModal.billingInfo.info')}
          </Text>
        </div>
      )}
      <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)">
        {t('payment.paymentMethod')}
      </Text>
      <Link className={styles.wrapper} to={billingSettingUrl}>
        {contentForm.leftElement && <div className={styles.logo}>{contentForm.leftElement}</div>}
        <p className={styles.cardNumber}>{contentForm.value}</p>
        <Icomoon size="md" type="ph-pencil-simple" />
      </Link>
      {isFromCheckoutModal && (
        <div className={styles.currencyPickerContainer}>
          <CurrencyPicker value={billingInfo.currency} readOnly />
        </div>
      )}
    </div>
  );
};

export default PaymentMethodInfo;
