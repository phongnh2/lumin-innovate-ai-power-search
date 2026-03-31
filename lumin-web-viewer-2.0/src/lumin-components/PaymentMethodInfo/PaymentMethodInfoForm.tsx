import classNames from 'classnames';
import { TextInput } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';

import ApplePaymentMethodIcon from 'assets/lumin-svgs/apple-payment-method.svg';
import CashappPaymentMethod from 'assets/lumin-svgs/cashapp-payment-method.svg';
import GooglePaymentMethodIcon from 'assets/lumin-svgs/google-payment-method.svg';
import LinkPaymentMethod from 'assets/lumin-svgs/link-payment-method.svg';

import Input from 'lumin-components/Shared/Input';

import { CardWallet, PaymentMethodTypeEnums } from 'constants/plan.enum';

import { IPaymentMethod } from 'interfaces/payment/payment.interface';

import styles from './PaymentMethodInfo.module.scss';

interface PaymentMethodInfoFormProps {
  paymentMethod: IPaymentMethod;
  className?: string;
  isEnableReskin?: boolean;
}

type ContentFormType = {
  value: string;
  rightElement?: React.ReactNode;
};

const WalletIconMapping = {
  [CardWallet.APPLE_PAY]: ApplePaymentMethodIcon,
  [CardWallet.GOOGLE_PAY]: GooglePaymentMethodIcon,
};

const altWalletNameMapping = {
  [CardWallet.APPLE_PAY]: 'Apple Pay',
  [CardWallet.GOOGLE_PAY]: 'Google Pay',
};

const PaymentMethodInfoForm = ({ paymentMethod, className, isEnableReskin }: PaymentMethodInfoFormProps) => {
  const contentForm = useMemo((): ContentFormType => {
    const { type, card, link, cashapp } = paymentMethod;
    switch (type) {
      case PaymentMethodTypeEnums.LINK:
        return {
          value: link?.email || '',
          rightElement: <img src={LinkPaymentMethod} alt="Link payment method" />,
        };
      case PaymentMethodTypeEnums.CASHAPP:
        return {
          value: cashapp?.email || '',
          rightElement: <img src={CashappPaymentMethod} alt="Cash App payment method" />,
        };
      case PaymentMethodTypeEnums.CARD:
      default:
        return {
          value: ['**** **** ****', card?.last4].join(' '),
          rightElement: WalletIconMapping[card.wallet] ? (
            <img src={WalletIconMapping[card.wallet]} alt={`${altWalletNameMapping[card.wallet]} payment method`} />
          ) : null,
        };
    }
  }, [paymentMethod]);

  if (isEnableReskin) {
    return (
      <div className={classNames(styles.inputWrapper, className)}>
        <TextInput
          id="stripe-card"
          name="stripe-card"
          value={contentForm.value}
          size="lg"
          readOnly
          classNames={{ input: styles.link }}
          rightSection={contentForm.rightElement}
        />
      </div>
    );
  }

  return (
    <div className={classNames(styles.inputWrapper, className)}>
      <Input
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        id="stripe-card"
        name="stripe-card"
        classes={{ input: styles.input }}
        value={contentForm.value}
        readOnly
      />
      {contentForm.rightElement && <div className={styles.inputRightElement}>{contentForm.rightElement}</div>}
    </div>
  );
};

export default PaymentMethodInfoForm;
