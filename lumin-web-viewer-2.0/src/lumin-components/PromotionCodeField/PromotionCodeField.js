import { withApollo } from '@apollo/client/react/hoc';
import { Collapse } from '@mui/material';
import { IconButton, Text, Collapse as KiwiCollapse, TextInput, Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { batch } from 'react-redux';

import PromotionCodeImage from 'assets/reskin/lumin-svgs/promotion-code.svg';

import ButtonMaterial, { ButtonColor } from 'lumin-components/ButtonMaterial';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import ButtonIcon from 'lumin-components/Shared/ButtonIcon';
import * as InputStripeStyled from 'lumin-components/StripePaymentForm/components/InputStripe/InputStripe.styled';
import Input from 'luminComponents/Shared/Input';
import SvgElement from 'luminComponents/SvgElement';

import { useEnableWebReskin, useMatchPaymentRoute, useTabletMatch, useTranslation } from 'hooks';

import { paymentServices } from 'services';

import { commonUtils, paymentUtil, numberUtils } from 'utils';
import errorExtract from 'utils/error';
import { FORM_INPUT_NAME } from 'utils/Factory/EventCollection/FormEventCollection';

import { ErrorCode } from 'constants/errorCode';
import { Colors } from 'constants/styles/Colors';

import * as Styled from './PromotionCodeField.styled';

import styles from './PromotionCodeField.module.scss';

const COUPON_TYPE_AMOUNT = 'amount_off';

const PromotionCodeField = ({
  billingInfo,
  changeBillingInfo,
  onFieldTouched,
  onFieldComplete,
  isPurchasing,
  disabled,
  currentOrganization,
}) => {
  const { plan, period, promotion } = useMatchPaymentRoute();
  const { couponCode, couponValue, currency, stripeAccountId, isValidatingCoupon } = billingInfo;
  const isTabletMatch = useTabletMatch();
  const [couponField, setCouponField] = useState('');
  const [isEnablePromotionInput, setIsPromotionInput] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpand, setIsExpand] = useState(false);
  const currencySymbol = paymentUtil.convertCurrencySymbol(currency);
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const buttonSize = isTabletMatch ? ButtonSize.XL : ButtonSize.MD;
  const { _id: orgId } = currentOrganization || {};
  const promotionCode = couponField || promotion;

  const setValidatingCoupon = (value) => {
    changeBillingInfo('isValidatingCoupon', value);
  };

  const applyCouponCode = async () => {
    if (promotionCode) {
      try {
        setValidatingCoupon(true);
        const payload = {
          period: period.toUpperCase(),
          currency,
          plan,
          couponCode: promotionCode,
          orgId,
          stripeAccountId,
        };
        const data = await paymentServices.applyCouponCode(payload);
        batch(() => {
          setIsPromotionInput(false);
          changeBillingInfo('couponCode', promotionCode);
          changeBillingInfo('couponValue', {
            type: data.couponValue.type,
            value: data.couponValue.value,
            couponCode: promotionCode,
          });
          setValidatingCoupon(false);
        });
      } catch (error) {
        const { code, message } = errorExtract.extractGqlError(error);
        batch(() => {
          setIsPromotionInput(true);
          changeBillingInfo('couponValue', {});
          setValidatingCoupon(false);
          if (code === ErrorCode.Payment.INVALID_COUPON_CODE) {
            setErrorMessage(t('errorMessage.invalidCouponCode'));
          } else {
            setErrorMessage(message);
          }
        });
      }
    }
  };

  const handleInputPaymentCode = (e) => {
    const couponCode = e.target.value;
    setCouponField(couponCode);
    setErrorMessage('');
  };

  const onPaymentInputBlur = () => {
    onFieldComplete(FORM_INPUT_NAME.PROMOTION_CODE);
    if (!couponField) {
      setErrorMessage('');
    }
  };

  const handleCancelCoupon = () => {
    changeBillingInfo('couponCode', '');
    changeBillingInfo('couponValue', {});
    setIsPromotionInput(true);
    setCouponField('');
  };

  useEffect(() => {
    if (promotion) {
      setCouponField(promotion);
      setIsExpand(true);
      applyCouponCode();
    }
  }, [period]);

  useEffect(() => {
    if (!promotion) {
      setIsPromotionInput(true);
      setCouponField('');
      setErrorMessage('');
      changeBillingInfo('couponCode', '');
      changeBillingInfo('couponValue', {});
    }
  }, [period]);

  const renderTicket = (isReskin) => {
    const couponText = ` (-${couponValue.type === COUPON_TYPE_AMOUNT ? currencySymbol : ''}${
      couponValue.type === COUPON_TYPE_AMOUNT
        ? numberUtils.formatTwoDigitsDecimal(couponValue.value / 100)
        : couponValue.value
    }${couponValue.type === COUPON_TYPE_AMOUNT ? '' : '%'})`;

    if (isReskin) {
      return (
        <div className={styles.ticketWrapper}>
          <div className={styles.ticket}>
            <Text component="span" type="headline" size="xs" color="var(--kiwi-colors-surface-on-surface)">
              {couponCode}
            </Text>
            <Text component="span" type="headline" size="xs" color="var(--kiwi-colors-semantic-error)">
              {couponText}
            </Text>
          </div>
          <IconButton
            icon="x-md"
            size="md"
            color="var(--kiwi-colors-surface-on-surface)"
            onClick={handleCancelCoupon}
          />
        </div>
      );
    }

    return (
      <Styled.TickerSection>
        <Styled.Ticket>
          <Styled.TextTicket>{couponCode}</Styled.TextTicket>&nbsp;
          <Styled.TextTicket couponValue={couponValue}>{couponText}</Styled.TextTicket>
        </Styled.Ticket>

        <ButtonIcon
          icon="cancel"
          disabled={isPurchasing}
          iconColor={Colors.NEUTRAL_60}
          iconSize={14}
          onClick={handleCancelCoupon}
        />
      </Styled.TickerSection>
    );
  };

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.label}>
            <img src={PromotionCodeImage} alt="Promotion code" className={styles.promotionCodeImg} />
            <Text type="headline" size="xs">
              {commonUtils.formatTitleCaseByLocale(t('payment.addPromotionCode'))}
            </Text>
          </div>
          {!couponField && (
            <IconButton
              icon={isExpand ? 'minus-md' : 'plus-md'}
              size="md"
              onClick={() => setIsExpand((prevState) => !prevState)}
            />
          )}
        </div>
        <KiwiCollapse in={isExpand}>
          <div className={styles.collapseContent}>
            {isEnablePromotionInput ? (
              <>
                <div className={styles.promotionInputHeader}>
                  <Text type="title" size="sm">
                    {t('payment.promotionCode')}&nbsp;({t('payment.optional')})
                  </Text>
                </div>
                <div className={styles.promotionInputField}>
                  <TextInput
                    size="lg"
                    name={FORM_INPUT_NAME.PROMOTION_CODE}
                    placeholder={t('payment.yourCode')}
                    value={couponField}
                    error={errorMessage}
                    onChange={handleInputPaymentCode}
                    onBlur={onPaymentInputBlur}
                    onFocus={() => onFieldTouched(FORM_INPUT_NAME.PROMOTION_CODE)}
                    disabled={isValidatingCoupon || disabled}
                    className={styles.input}
                    classNames={{
                      wrapper: styles.wrapper,
                    }}
                  />
                  <Button
                    size="lg"
                    onClick={applyCouponCode}
                    disabled={!couponField || isValidatingCoupon || !!errorMessage}
                    loading={isValidatingCoupon}
                  >
                    {t('payment.applyCode')}
                  </Button>
                </div>
              </>
            ) : (
              renderTicket(true)
            )}
          </div>
        </KiwiCollapse>
      </div>
    );
  }

  return (
    <Styled.Container $isExpand={isExpand}>
      <Styled.Header>
        <Styled.Label>
          <SvgElement content="promotion-code" width={30} height={20} />
          <Styled.Text>{commonUtils.formatTitleCaseByLocale(t('payment.addPromotionCode'))}</Styled.Text>
        </Styled.Label>
        {!couponField && (
          <ButtonIcon
            icon={isExpand ? 'minus' : 'plus-thin'}
            iconColor={Colors.NEUTRAL_60}
            iconSize={16}
            onClick={() => setIsExpand((prevState) => !prevState)}
          />
        )}
      </Styled.Header>

      <Collapse in={isExpand}>
        <Styled.Wrapper $isEnablePromotionInput={isEnablePromotionInput}>
          {isEnablePromotionInput ? (
            <>
              <InputStripeStyled.Header>
                <InputStripeStyled.Label>
                  {t('payment.promotionCode')} <Styled.LabelOptional>({t('payment.optional')})</Styled.LabelOptional>
                </InputStripeStyled.Label>
              </InputStripeStyled.Header>
              <Styled.InputSection>
                <Styled.InputBox>
                  <Input
                    name={FORM_INPUT_NAME.PROMOTION_CODE}
                    placeholder={t('payment.yourCode')}
                    value={couponField}
                    onChange={handleInputPaymentCode}
                    onBlur={onPaymentInputBlur}
                    hideValidationIcon
                    fullWidth
                    showClearButton
                    errorMessage={errorMessage}
                    onFocus={() => onFieldTouched(FORM_INPUT_NAME.PROMOTION_CODE)}
                    disabled={isValidatingCoupon || disabled}
                  />
                </Styled.InputBox>

                <Styled.ApplyButton>
                  <ButtonMaterial
                    onClick={applyCouponCode}
                    disabled={!couponField || isValidatingCoupon || !!errorMessage}
                    loading={isValidatingCoupon}
                    fullWidth
                    size={buttonSize}
                    color={ButtonColor.SECONDARY_BLACK}
                  >
                    {t('payment.applyCode')}
                  </ButtonMaterial>
                </Styled.ApplyButton>
              </Styled.InputSection>
            </>
          ) : (
            renderTicket()
          )}
        </Styled.Wrapper>
      </Collapse>
    </Styled.Container>
  );
};

PromotionCodeField.propTypes = {
  billingInfo: PropTypes.object.isRequired,
  changeBillingInfo: PropTypes.func.isRequired,
  onFieldTouched: PropTypes.func,
  onFieldComplete: PropTypes.func,
  isPurchasing: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  currentOrganization: PropTypes.object,
};

PromotionCodeField.defaultProps = {
  disabled: false,
  currentOrganization: {},
  onFieldTouched: () => {},
  onFieldComplete: () => {},
};

export default withApollo(PromotionCodeField);
