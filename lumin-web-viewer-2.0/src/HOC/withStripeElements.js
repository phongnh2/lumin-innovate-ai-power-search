import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import useValidateRecaptcha from 'screens/Payment/hooks/useValidateRecaptcha';

import AppCircularLoading from 'lumin-components/AppCircularLoading';
import ErrorBoundary from 'lumin-components/ErrorBoundary';

import { useEnableWebReskin, usePaymentFreeTrialPageReskin, useTranslation } from 'hooks';

import { getLanguage } from 'utils/getLanguage';

import { Appearance, AppearanceNewUI, AppearanceReskin } from 'constants/theme/PaymentElement/appearance';
import { Inter } from 'constants/theme/PaymentElement/fontInter500';
import { AxiformaRegular } from 'constants/theme/PaymentElement/fonts';

const withStripeElements =
  (Component, { action, skipRecaptcha, noTopGapLoading }) =>
  (props) => {
    const { organizationId, isFetchedCard, currentPaymentMethod } = props || {};
    const { t } = useTranslation();
    const { isEnableReskinUI } = usePaymentFreeTrialPageReskin();
    const { isEnableReskin } = useEnableWebReskin();
    const isPurchasing = useSelector(selectors.getPurchaseState);
    const language = getLanguage();

    const {
      secretData,
      refetchSecret: getNewSecret,
      loading,
    } = useValidateRecaptcha({
      skipRecaptcha,
      action,
      organizationId,
      currentPaymentMethod,
      isFetchedCard,
      isPurchasing,
    });
    const { clientSecret, accountId } = secretData || {};
    const stripePromise = useMemo(
      () => loadStripe(process.env.STRIPE_PLATFORM_PUBLIC_KEY, { stripeAccount: accountId }),
      [accountId]
    );
    const renderContent = () => {
      const hasLoadedFormFailed = !clientSecret && !currentPaymentMethod && isFetchedCard;
      if (loading) {
        return <AppCircularLoading noTopGap={!!noTopGapLoading} />;
      }
      if (hasLoadedFormFailed) {
        return <p style={{ textAlign: 'center' }}>{t('payment.failedToLoadPaymentForm')}</p>;
      }

      const font =
        isEnableReskinUI || isEnableReskin
          ? {
              family: 'Inter',
              src: `url(data:font/truetype;charset=utf-8;base64,${Inter})`,
              weight: '500',
              display: 'swap',
            }
          : {
              family: 'Axiforma',
              src: `url(data:font/truetype;charset=utf-8;base64,${AxiformaRegular})`,
              weight: '400',
              display: 'swap',
            };

      const appearance = () => {
        if (isEnableReskin) {
          return AppearanceReskin;
        }
        if (isEnableReskinUI) {
          return AppearanceNewUI;
        }
        return Appearance;
      };

      const options = {
        clientSecret,
        appearance: appearance(),
        fonts: [font],
        locale: language,
      };
      return (
        <Elements stripe={stripePromise} options={options}>
          <Component
            {...props}
            hasClientSecret={!!clientSecret}
            getNewSecret={getNewSecret}
            stripeAccountId={accountId}
          />
        </Elements>
      );
    };

    return <ErrorBoundary>{renderContent()}</ErrorBoundary>;
  };

export default withStripeElements;
