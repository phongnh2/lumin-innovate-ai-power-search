import { Dialog } from 'lumin-ui/kiwi-ui';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import GoogleReCaptchaV3Provider from 'lumin-components/GoogleReCaptchaV3Provider';

import withGetPaymentInfo from 'HOC/withGetPaymentInfo';

import { useFetchPaymentCard, useGetCurrencyBaseOnLocation } from 'hooks';

import logger from 'helpers/logger';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { VARIATION_NAME } from 'features/CNC/constants/events/variation';
import { useGetUrlPaymentTrial } from 'features/CNC/hooks/useGetUrlPaymentTrial';

import { LOGGER } from 'constants/lumin-common';
import { CURRENCY } from 'constants/paymentConstant';
import { PERIOD } from 'constants/plan';
import { PaymentCurrency, PaymentPeriod } from 'constants/plan.enum';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { IOrganization } from 'interfaces/organization/organization.interface';

import BillingModalBody from './BillingModalBody';
import { BILLING_FORM_STEP, IPaymentCardInfo } from './constants/billingModal';
import { FreeTrialContainerWithStripeElements } from './contexts/BillingFormContext';
import { TrialBillingModalContext } from './contexts/TrialBillingModalContext';

import styles from './BillingModal.module.scss';

const BillingModal = ({
  organization,
  setOpenBillingModal,
}: {
  organization: IOrganization;
  setOpenBillingModal: (open: boolean) => void;
}) => {
  const { plan } = useGetUrlPaymentTrial({ currentOrg: organization });
  const { locationCurrency, loading: isFetchingCurrency } = useGetCurrencyBaseOnLocation();
  const [billingInfo, setBillingInfo] = useState({
    currency: (locationCurrency || CURRENCY.USD.value) as PaymentCurrency,
    isCardFilled: false,
    organizationId: organization._id,
    stripeAccountId: '',
    period: PERIOD.ANNUAL as PaymentPeriod,
    plan,
    organization,
    isFreeTrial: true,
  });
  const [isFetchedCard, setIsFetchedCard] = useState(false);

  const [billingFormStep, setBillingFormStep] = useState(BILLING_FORM_STEP.WORKSPACE_INFO);
  const [searchParams, setSearchParams] = useSearchParams();

  const modalEventData = {
    modalName: ModalName.CHECKOUT_ON_VIEWER,
    modalPurpose: ModalPurpose[ModalName.CHECKOUT_ON_VIEWER],
    variationName: VARIATION_NAME.CHECKOUT_ON_VIEWER_WEB_POP_OVER,
  };

  const {
    isLoading: isFetchingCardInfo,
    customerInfo,
    currentPaymentMethod,
  } = useFetchPaymentCard({
    clientId: billingInfo.organizationId,
    setIsFetchedCard: () => setIsFetchedCard(true),
  }) as IPaymentCardInfo;

  const closeModal = useCallback(() => {
    setOpenBillingModal(false);
    const from = searchParams.get(UrlSearchParam.FROM);
    if (from === 'prepaid_card') {
      setSearchParams(
        (prev) => {
          prev.delete(UrlSearchParam.FROM);
          return prev.toString();
        },
        { replace: true }
      );
    }
  }, [searchParams]);

  const context = useMemo(
    () => ({
      billingInfo,
      setBillingInfo,
      isFetchingCardInfo,
      currentPaymentMethod,
      isFetchingCurrency,
      customerInfo,
      isFetchedCard,
      setIsFetchedCard,
      billingFormStep,
      setBillingFormStep,
      closeModal,
    }),
    [
      billingInfo,
      isFetchingCardInfo,
      currentPaymentMethod,
      isFetchingCurrency,
      customerInfo,
      isFetchedCard,
      billingFormStep,
      setBillingFormStep,
      closeModal,
    ]
  );

  const onCancel = () => {
    closeModal();
    modalEvent
      .modalDismiss(modalEventData)
      .catch((error: unknown) => logger.logError({ error, reason: LOGGER.Service.TRACK_EVENT_ERROR }));
  };

  useEffect(() => {
    setBillingInfo((prev) => ({
      ...prev,
      isCardFilled: Boolean(currentPaymentMethod),
    }));
  }, [currentPaymentMethod]);

  useEffect(() => {
    setBillingInfo((prev) => ({
      ...prev,
      currency: customerInfo?.currency || locationCurrency || (CURRENCY.USD.value as PaymentCurrency),
    }));
  }, [locationCurrency, customerInfo?.currency]);

  useEffect(() => {
    modalEvent
      .modalViewed(modalEventData)
      .catch((error: unknown) => logger.logError({ error, reason: LOGGER.Service.TRACK_EVENT_ERROR }));
  }, []);

  return (
    <Dialog
      opened
      onClose={() => {}}
      padding="none"
      classNames={{
        content: styles.dialogContent,
        inner: styles.dialogInner,
      }}
      style={{
        '--modal-content-max-height': 'calc(100vh - 2 * 100px)',
      }}
      centered={false}
    >
      <GoogleReCaptchaV3Provider>
        <TrialBillingModalContext.Provider value={context}>
          <FreeTrialContainerWithStripeElements
            organizationId={billingInfo.organizationId}
            isFetchedCard={isFetchedCard}
            currentPaymentMethod={currentPaymentMethod}
          >
            <BillingModalBody closeModal={onCancel} />
          </FreeTrialContainerWithStripeElements>
        </TrialBillingModalContext.Provider>
      </GoogleReCaptchaV3Provider>
    </Dialog>
  );
};

export default withGetPaymentInfo(BillingModal);
