/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import classNames from 'classnames';
import { Chip, Radio, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import Selected from 'assets/lumin-svgs/selected.svg';
import Unselected from 'assets/lumin-svgs/unselected.svg';

import { useEnableWebReskin, useTranslation, usePaymentFreeTrialPageReskin } from 'hooks';

import { paymentUtil, numberUtils, eventTracking } from 'utils';

import { PeriodType } from 'features/CNC/CncComponents/CheckoutModal/interface';
import { CHECKOUT_ON_VIEWER_VARIANT } from 'features/CNC/hooks/useOpenCheckoutOnViewer';

import { AWS_EVENTS } from 'constants/awsEvents';
import { PaymentCurrency } from 'constants/plan.enum';

import * as Styled from './PaymentSwitchComponent.styled';

import styles from './PaymentSwitchComponent.module.scss';

type Props = {
  radioList: PeriodType[];
  period: string;
  onChange: (value: string) => void;
  unitPrice: number;
  currency: PaymentCurrency;
  from?: CHECKOUT_ON_VIEWER_VARIANT;
};

const DEBOUNCE_TRACKING_TIME = 500;

type EventTrackingAttributes = {
  selectedPaymentPeriod: string;
};

const PaymentSwitchComponent = ({ radioList, period, onChange, unitPrice, currency, from }: Props): JSX.Element => {
  const { t } = useTranslation();
  const { isEnableReskinUI } = usePaymentFreeTrialPageReskin();
  const { isEnableReskin } = useEnableWebReskin();
  const debounceEventTracking = useDebouncedCallback((eventType: string, attributes: EventTrackingAttributes) => {
    eventTracking(eventType, attributes).catch(() => {});
  }, DEBOUNCE_TRACKING_TIME);
  const isFromCheckoutModal = from === CHECKOUT_ON_VIEWER_VARIANT.MODAL;

  const handleChangePeriod = (value: string) => {
    onChange(value);
    debounceEventTracking(AWS_EVENTS.PAYMENT.PAYMENT_PERIOD_CHANGED, {
      selectedPaymentPeriod: value.toLowerCase(),
    });
  };

  const currencySymbol = paymentUtil.convertCurrencySymbol(currency);

  const StyledComponents = isEnableReskinUI
    ? {
        Wrapper: Styled.WrapperReskin,
        ItemWrapper: Styled.ItemWrapperReskin,
        Text: Styled.TextReskin,
        DescriptionLeft: Styled.DescriptionLeftReskin,
        DescriptionRight: Styled.DescriptionRightReskin,
        BillAnnual: Styled.BillAnnualReskin,
        Discount: Styled.DiscountReskin,
      }
    : {
        Wrapper: Styled.Wrapper,
        ItemWrapper: Styled.ItemWrapper,
        Text: Styled.Text,
        DescriptionLeft: Styled.DescriptionLeft,
        DescriptionRight: Styled.DescriptionRight,
        BillAnnual: Styled.BillAnnual,
        Discount: Styled.Discount,
      };

  if (isEnableReskin) {
    return (
      <div className={styles.wrapper}>
        {radioList.map((item, index) => {
          const isChecked = period === item.value;
          return (
            <div
              data-checked={isChecked}
              key={index}
              onClick={() => handleChangePeriod(item.value)}
              className={classNames([styles.itemWrapper, isFromCheckoutModal && styles.checkoutModalItemWrapper])}
              role="presentation"
            >
              <label htmlFor={item.value} className={styles.labelGroup}>
                <div className={styles.checkboxContainer}>
                  <Radio
                    id={item.value}
                    checked={isChecked}
                    onChange={() => handleChangePeriod(item.value)}
                    name={item.name}
                    data-lumin-btn-name={item.name}
                  />
                  <Text size="xs" type="headline">
                    {item.label}
                  </Text>
                </div>
                {item.showDiscount && (
                  <Text type="label" size="xs" color="var(--kiwi-colors-surface-on-surface-variant)">
                    {t('payment.billAnnual', { currencySymbol, price: numberUtils.formatDecimal(unitPrice * 12) })}
                  </Text>
                )}
                {item.showDiscount && (
                  <div className={styles.discount}>
                    <Chip colorType="blue" variant="solid" label={t('payment.save5Months')} />
                  </div>
                )}
              </label>
              <div className={styles.description}>
                <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
                  {item.description.price}
                </Text>
                <Chip colorType="blue" label={item.description.documents} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Styled.Container>
      <StyledComponents.Wrapper>
        {radioList.map((item, index) => {
          const isChecked = period === item.value;
          return (
            <StyledComponents.ItemWrapper $checked={isChecked} key={index} onClick={() => onChange(item.value)}>
              <Styled.Group htmlFor={item.value}>
                <Styled.CheckboxContainer>
                  {isEnableReskinUI ? (
                    <Styled.Checkbox checked={isChecked} />
                  ) : (
                    <Styled.ImageWrapper>
                      <Styled.Image
                        src={isChecked ? Selected : Unselected}
                        alt={isChecked ? 'Selected' : 'Unselected'}
                      />
                    </Styled.ImageWrapper>
                  )}
                  <StyledComponents.Text>{item.label}</StyledComponents.Text>
                  <Styled.Input
                    id={item.value}
                    type="radio"
                    checked={isChecked}
                    onChange={() => onChange(item.value)}
                    name="trial-period"
                    data-lumin-btn-name={item.name}
                  />
                </Styled.CheckboxContainer>
                {item.showDiscount && (
                  <StyledComponents.BillAnnual>
                    {t('payment.billAnnual', { currencySymbol, price: numberUtils.formatDecimal(unitPrice * 12) })}
                  </StyledComponents.BillAnnual>
                )}
                {item.showDiscount && <StyledComponents.Discount>{t('payment.save5Months')}</StyledComponents.Discount>}
              </Styled.Group>
              <Styled.Description>
                <StyledComponents.DescriptionLeft>{item.description.price}</StyledComponents.DescriptionLeft>
                <StyledComponents.DescriptionRight>{item.description.documents}</StyledComponents.DescriptionRight>
              </Styled.Description>
            </StyledComponents.ItemWrapper>
          );
        })}
      </StyledComponents.Wrapper>
    </Styled.Container>
  );
};

export default PaymentSwitchComponent;
