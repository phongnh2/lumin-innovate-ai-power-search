import PropTypes from 'prop-types';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from 'styled-components';

import PaymentSwitchComponent from 'lumin-components/PaymentSwitchComponent';

import { useEnableWebReskin, useMatchPaymentRoute, useOrganizationPayment, useTranslation } from 'hooks';

import { numberUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { PaymentUrlSerializer } from 'utils/payment';
import paymentUtil from 'utils/paymentUtil';

import { NUMBER_OF_MONTHS_IN_YEAR } from 'constants/commonConstant';
import { CURRENCY } from 'constants/paymentConstant';
import { PERIOD, PRICE } from 'constants/plan';

const NewPeriodGroup = ({ billingInfo, changeBillingInfo }) => {
  const { currency } = billingInfo;
  const { period, plan, search, promotion } = useMatchPaymentRoute();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganizationPayment({ billingInfo });
  const { payment: orgPayment = {} } = currentOrganization || {};
  const { docStackStorage: orgDocStack } = currentOrganization || {};
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const getQuantity = () => (currentOrganization ? currentOrganization.payment.quantity : 0);

  const getPriceUnit = ({ period: _period }) => {
    const { totalBlock } = paymentUtil.getNextDocStack({
      quantity: getQuantity(),
      nextPlan: plan,
      nextPeriod: _period,
      currentPeriod: orgPayment.period,
      currentPlan: orgPayment.type,
      currentStatus: orgPayment.status,
      totalDocStackUsed: orgDocStack?.totalUsed || 0,
    });
    return (PRICE.V3[_period][plan] / (_period === PERIOD.ANNUAL ? NUMBER_OF_MONTHS_IN_YEAR : 1)) * totalBlock;
  };

  const getDescription = ({ period: _period }) => {
    const currencySymbol = paymentUtil.convertCurrencySymbol(currency);
    const { nextDocStack } = paymentUtil.getNextDocStack({
      quantity: getQuantity(),
      nextPlan: plan,
      nextPeriod: _period,
      currentPeriod: orgPayment.period,
      currentPlan: orgPayment.type,
      currentStatus: orgPayment.status,
      totalDocStackUsed: orgDocStack?.totalUsed || 0,
    });
    return {
      price: t('payment.pricePerUnit', { currencySymbol, priceUnit: numberUtils.formatDecimal(getPriceUnit({ period: _period })) }),
      documents: t('payment.nextDocStack', { nextDocStack }),
    };
  };

  const getRadioList = () => [
    {
      value: PERIOD.MONTHLY,
      label: t('freeTrialPage.monthly'),
      name: ButtonName.PERIOD_SWITCH_TO_MONTHLY,
      description: getDescription({ period: PERIOD.MONTHLY }),
    },
    {
      value: PERIOD.ANNUAL,
      label: t('freeTrialPage.annual'),
      name: ButtonName.PERIOD_SWITCH_TO_YEARLY,
      showDiscount: true,
      description: getDescription({ period: PERIOD.ANNUAL }),
    },
  ];

  const onChange = (period) => {
    if (promotion) {
      changeBillingInfo('isValidatingCoupon', true);
    }

    const urlSerializer = new PaymentUrlSerializer().plan(plan).period(period).searchParam(search);
    navigate(urlSerializer.get(), { replace: true });
  };

  return (
    <div
      css={
        !isEnableReskin &&
        css`
          margin-bottom: 24px;
        `
      }
    >
      <PaymentSwitchComponent
        radioList={getRadioList()}
        period={period}
        onChange={onChange}
        unitPrice={getPriceUnit({ period: PERIOD.ANNUAL })}
        hidePromote
        currency={currency}
      />
    </div>
  );
};

NewPeriodGroup.propTypes = {
  billingInfo: PropTypes.shape({
    currency: PropTypes.oneOf(Object.values(CURRENCY).map((item) => item.value)).isRequired,
    organizationId: PropTypes.string,
  }),
  changeBillingInfo: PropTypes.func,
};

NewPeriodGroup.defaultProps = {
  billingInfo: {
    organizationId: '',
  },
  changeBillingInfo: () => {},
};

export default NewPeriodGroup;
