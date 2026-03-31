/* eslint-disable @typescript-eslint/ban-ts-comment */
import { isEmpty } from 'lodash';
import React from 'react';
import { ReactI18NextChild, Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';

import { useTranslation } from 'hooks';

import { numberUtils, paymentUtil } from 'utils';

import { FEATURE_TYPE } from 'constants/detailPlanConstants';
import { PaymentCurrency } from 'constants/plan.enum';
import { Colors } from 'constants/styles';

import * as Styled from './PlanCell.styled';

const PlanCell = ({ type, value }: { type: string; value: string }): JSX.Element => {
  const { t } = useTranslation();
  const { value: locationCurrency } = useSelector<unknown, { value: PaymentCurrency }>(
    selectors.getLocationCurrency,
    shallowEqual
  );
  const currencySymbol = paymentUtil.convertCurrencySymbol(locationCurrency);

  const columWrapper = (children: string | ReactI18NextChild | Iterable<ReactI18NextChild>): JSX.Element => (
    <Styled.FeatureValueCol $empty={!children}>
      <Styled.Cell>{children}</Styled.Cell>
    </Styled.FeatureValueCol>
  );

  const getPriceText = (price: number): JSX.Element =>
    !price ? (
      <Styled.BoldPrice $bold={isEmpty(price)}>
        {currencySymbol}
        {numberUtils.formatDecimal(price)}
      </Styled.BoldPrice>
    ) : (
      <span>
        <Trans
          i18nKey="plan.planExplain.startsAt"
          values={{ price: `${currencySymbol}${price}` }}
          components={{
            bold1: <Styled.BoldPrice $bold={isEmpty(price)} />,
            bold2: <Styled.BoldPrice $bold />,
          }}
        />
      </span>
    );

  switch (type) {
    case FEATURE_TYPE.TEXT:
      return columWrapper(t(value));
    case FEATURE_TYPE.PRICE:
      return columWrapper(getPriceText(value as unknown as number));
    case FEATURE_TYPE.CHECKED_ICON: {
      // @ts-ignore
      const icon = <Icomoon className="success" color={Colors.SUCCESS_50} size={24} />;
      return columWrapper(icon);
    }
    default:
      return columWrapper(null);
  }
};

export default PlanCell;
