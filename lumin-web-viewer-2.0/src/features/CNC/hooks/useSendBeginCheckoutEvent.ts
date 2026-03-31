import { capitalize, isNil, snakeCase, startCase } from 'lodash';
import { useEffect, useRef } from 'react';

import { useGetPlanName, useMatchPaymentRoute } from 'hooks';

import { ga } from 'utils';

import { useCheckBusinessDomain } from './useCheckBusinessDomain';

type Params = {
  eventPlanName: string;
  amountDue: string;
  period: string;
  currency: string;
  price: number;
  discount: string;
  coupon: string;
  organizationId: string;
};

const useSendBeginCheckoutEvent = ({ amountDue, currency, price, discount, coupon, organizationId }: Params) => {
  const { period, isFreeTrial, promotion } = useMatchPaymentRoute();
  const planName = useGetPlanName();
  const { isBusinessDomain } = useCheckBusinessDomain();
  const lastCoupon = useRef<string>(undefined);
  const lastPeriod = useRef<string>(undefined);
  const trialText = isFreeTrial && 'Trial';
  const eventPlanName = startCase([planName, trialText, capitalize(period), 'plan'].filter(Boolean).join(' '));
  const planNameEventId = snakeCase(eventPlanName);

  const attributes = {
    value: isFreeTrial ? 0 : amountDue,
    currency,
    ...(!isFreeTrial ? { coupon } : {}),
    items: [
      {
        item_id: planNameEventId,
        item_name: eventPlanName,
        price: isFreeTrial ? 0 : price,
        ...(!isFreeTrial ? { discount, coupon } : {}),
      },
    ],
    ...(isBusinessDomain && { isBusinessDomain: 'true' }),
    extraInfo: {
      organizationId,
    },
  };

  const sendBeginCheckoutEvent = () => {
    const isLastCouponSameAsPromotion = lastCoupon.current === promotion;
    const isLastCouponSameAsCoupon = lastCoupon.current === coupon;

    // Case: Change period
    if (lastPeriod.current !== period) {
      ga.trackingBeginCheckout(attributes);
      lastCoupon.current = coupon;
      lastPeriod.current = period;
      return;
    }

    // Case: Have Promotion in url
    if (promotion) {
      const isCouponRemovedAfterSentEvent = !coupon && isLastCouponSameAsPromotion;
      const isSendedEventWithInvalidPromotion = !coupon && isLastCouponSameAsCoupon;
      const isPromotionChanged = coupon && coupon !== promotion;

      if (isCouponRemovedAfterSentEvent || isSendedEventWithInvalidPromotion || isPromotionChanged) {
        return;
      }
    }

    // Case: Don't have Promotion in url
    if (!promotion) {
      const isSendedEventWithLastPromotion = !coupon && isLastCouponSameAsPromotion;
      if (coupon || isSendedEventWithLastPromotion) {
        return;
      }
    }

    ga.trackingBeginCheckout(attributes);
    lastCoupon.current = coupon;
    lastPeriod.current = period;
  };

  useEffect(() => {
    // Send for payment page
    if (!isFreeTrial && !isNil(price)) {
      sendBeginCheckoutEvent();
    }
  }, [price]);

  useEffect(() => {
    // Send for free trial payment page
    if (isFreeTrial) {
      ga.trackingBeginCheckout(attributes);
    }
  }, [period]);
};

export { useSendBeginCheckoutEvent };
