import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { batch } from 'react-redux';

import { useMatchPaymentRoute } from 'hooks';

import { paymentServices } from 'services';

import { paymentUtil } from 'utils';

import { Plans } from 'constants/plan';

const GET_REMAINING_DEBOUNCE_TIME = 100;

export const useRetrieveRemainingPlan = ({ billingInfo, canUpgrade, clientId, isFetchedCard }) => {
  const { period, plan } = useMatchPaymentRoute();
  const [remaining, setRemaining] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  const [total, setTotal] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [discountDescription, setDiscountDescription] = useState('');
  const [nextBilling, setNextBilling] = useState({
    time: null,
    price: null,
    creditBalance: null,
    loading: false,
  });
  const abortControllerRef = useRef();
  const { quantity, couponValue, currency, stripeAccountId, isValidatingCoupon } = billingInfo;
  const canUpgradeRef = useRef(canUpgrade);
  const quantityRef = useRef(quantity);

  const isOldPlan = (_plan) => _plan === Plans.BUSINESS;

  const setNextBillingLoading = (loading) =>
    setNextBilling((prevState) => ({
      ...prevState,
      loading,
    }));

  const getRemaining = (params) =>
    isOldPlan(params.plan)
      ? paymentServices.getRemainingPlan(params)
      : paymentServices.previewUpcomingDocStackInvoice({ ...params, orgId: params.clientId || null });

  const getRemainingDebouncing = useCallback(
    debounce(
      (params) => {
        const executer = params.clientId ? getRemaining : paymentServices.getBillingCycleOfPlan;
        abortControllerRef.current = new AbortController();
        return executer({ ...params, fetchOptions: { signal: abortControllerRef.current.signal } })
          .then((remainingRes) => {
            batch(() => {
              if (
                !canUpgradeRef.current ||
                (isOldPlan(params.plan) && !paymentUtil.isValidQuantity(quantityRef.current))
              ) {
                setTotal(0);
                return;
              }
              const remainingPrice = (remainingRes.remaining || 0) / 100;
              const creditBalance = (remainingRes.creditBalance || 0) / 100;
              const { isUpgradeDocStackAnnual } = remainingRes;
              setRemaining(remainingPrice);
              setTotal((remainingRes.total || 0) / 100);
              setAmountDue((remainingRes.amountDue || 0) / 100);
              setDiscount((remainingRes.discount || 0) / 100);
              setDiscountDescription(remainingRes.discountDescription || 0);
              setNextBilling((prevState) => ({
                ...prevState,
                time: remainingRes.nextBillingCycle,
                price: remainingRes.nextBillingPrice / 100,
                creditBalance,
                isUpgradeDocStackAnnual
              }));
            });
          })
          .finally(() => setNextBillingLoading(false));
      },
      GET_REMAINING_DEBOUNCE_TIME,
    ),
    [],
  );

  useEffect(() => {
    canUpgradeRef.current = canUpgrade;
    quantityRef.current = quantity;
  }, [canUpgrade, quantity]);

  useEffect(() => {
    if (isValidatingCoupon) {
      setNextBillingLoading(true);
      setTotal(null);
      return;
    }

    if (isFetchedCard || !clientId) {
      const retrieveRemaining = async () => {
        setNextBillingLoading(true);
        setTotal(null);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        await getRemainingDebouncing({
          clientId,
          plan,
          period,
          currency,
          quantity,
          couponCode: couponValue.couponCode,
          stripeAccountId,
        });
      };
      retrieveRemaining();
    }
  }, [
    period,
    plan,
    currency,
    clientId,
    quantity,
    canUpgrade,
    getRemainingDebouncing,
    couponValue?.couponCode,
    stripeAccountId,
    isFetchedCard,
    isValidatingCoupon,
  ]);

  return {
    remaining,
    total,
    nextBilling,
    amountDue,
    discount,
    discountDescription,
  };
};
