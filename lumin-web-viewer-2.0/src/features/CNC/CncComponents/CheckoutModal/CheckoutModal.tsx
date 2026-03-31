import classNames from 'classnames';
import { Dialog, Divider, IconButton, Link, Text } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import GoogleReCaptchaV3Provider from 'luminComponents/GoogleReCaptchaV3Provider';
import useGetContentTrialModal from 'luminComponents/StartTrialModal/useGetContentTrialModal';

import withGetPaymentInfo from 'HOC/withGetPaymentInfo';

import { useFetchPaymentCard, useGetCurrencyBaseOnLocation, useTranslation } from 'hooks';
import useGetNextPaymentInfo from 'hooks/useGetNextPaymentInfo';

import { paymentUtil } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import ReviewPanel from 'features/CNC/CncComponents/CheckoutModal/components/ReviewPanel';
import { CNCModalName } from 'features/CNC/constants/events/modal';
import { VARIATION_NAME } from 'features/CNC/constants/events/variation';
import useTrackingABTestModalEvent from 'features/CNC/hooks/useTrackingABTestModalEvent';

import { CONTACT_SUPPORT_URL } from 'constants/customConstant';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { CURRENCY } from 'constants/paymentConstant';
import { PERIOD } from 'constants/plan';
import { PaymentCurrency } from 'constants/plan.enum';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';

import { CheckoutModalWithStripeElements } from './CheckoutModalWithStripeElements';
import BillingInfo from './components/BillingInfo/BillingInfo';
import PaymentDetail from './components/PaymentDetail/PaymentDetail';
import PeriodSelection from './components/PeriodSelection/PeriodSelection';
import VerticalLinearStepper from './components/VerticalLinearStepper/VerticalLinearStepper';
import { BillingInfoType, CheckoutModalContext } from './context/CheckoutModalContext';
import { getRadioButtons } from './helper/getRadioButton';
import { IPaymentCardInfo, OrgPlan } from './interface';

import styles from './CheckoutModal.module.scss';

const CheckoutModal = ({
  organization,
  setOpenBillingModal,
}: {
  organization: IOrganization;
  setOpenBillingModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();
  const { locationCurrency, loading: isFetchingCurrency } = useGetCurrencyBaseOnLocation();
  const { trialPlan } = useGetContentTrialModal();

  const [billingInfo, setBillingInfo] = useState<BillingInfoType>({
    currency: (locationCurrency || CURRENCY.USD.value) as PaymentCurrency,
    isCardFilled: false,
    organizationId: organization._id,
    stripeAccountId: '',
    period: PERIOD.ANNUAL,
    plan: trialPlan,
    organization,
    isFreeTrial: true,
  });
  const [currentPaymentMethodType, setCurrentPaymentMethodType] = useState<string>('card');
  const [activeStep, setActiveStep] = useState(0);
  const [isFetchedCard, setIsFetchedCard] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentReady, setContentReady] = useState(false);

  const {
    isLoading: isFetchingCardInfo,
    customerInfo,
    currentPaymentMethod,
  } = useFetchPaymentCard({
    clientId: billingInfo.organizationId,
    setIsFetchedCard: () => setIsFetchedCard(true),
  }) as IPaymentCardInfo;

  useGetNextPaymentInfo({
    plan: billingInfo.plan,
    period: billingInfo.period,
    currency: billingInfo.currency,
    stripeAccountId: billingInfo.stripeAccountId,
    organizationId: billingInfo.organizationId,
    isFetchedCard,
    currentPaymentMethod,
  });

  const { trackModalConfirmation, trackModalDismiss } = useTrackingABTestModalEvent({
    modalName: CNCModalName.CHECKOUT_ON_VIEWER,
    hotjarEvent: HOTJAR_EVENT.CHECKOUT_ON_VIEWER,
    variationName: VARIATION_NAME.CHECKOUT_ON_VIEWER_CNC_MODAL_LEFT_HAND_SIDE,
  });

  const document = useSelector<unknown, IDocumentBase>(selectors.getCurrentDocument, shallowEqual);

  const context = useMemo(
    () => ({
      billingInfo,
      setBillingInfo,
      isFetchedCard,
      setIsFetchedCard,
      isFetchingCurrency,
      isFetchingCardInfo,
      currentPaymentMethod,
      customerInfo,
      currentPaymentMethodType,
      setCurrentPaymentMethodType,
    }),
    [
      billingInfo,
      isFetchedCard,
      isFetchingCurrency,
      isFetchingCardInfo,
      currentPaymentMethod,
      customerInfo,
      currentPaymentMethodType,
    ]
  );

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

  const setContentRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      contentRef.current = node;
      setContentReady(true);
    }
  }, []);

  const currencySymbol = paymentUtil.convertCurrencySymbol(billingInfo.currency);
  const planValue = billingInfo.plan as OrgPlan;
  const radioList = getRadioButtons({ t, currencySymbol, plan: planValue });

  const handleClose = () => {
    trackModalDismiss().catch(() => {});
    setOpenBillingModal(false);
  };

  const handleFailure = ({ callback }: { callback?: () => void }) => {
    setActiveStep(1);
    callback?.();
  };

  const currentStepMap = [
    {
      step: 0,
      component: (
        <PeriodSelection periodList={radioList} currentOrganization={organization} documentName={document.name} />
      ),
    },

    {
      step: 1,
      component: null,
    },
    {
      step: 2,
      component: <ReviewPanel />,
    },
  ];

  return (
    <Dialog
      opened
      size="lg"
      headerTitle={
        contentReady ? (
          <div className={styles.headerTitle}>
            <Text type="headline" size="lg" className={styles.headerTitleText}>
              {t('checkoutModal.title')}
            </Text>
          </div>
        ) : null
      }
      centered
      onClose={handleClose}
      closeOnClickOutside={false}
      closeOnEscape={false}
      padding="none"
      classNames={{
        content: classNames([styles.dialogContent, !contentReady && styles.loadingModal]),
      }}
    >
      <GoogleReCaptchaV3Provider>
        <CheckoutModalContext.Provider value={context}>
          <CheckoutModalWithStripeElements>
            <IconButton
              icon="x-lg"
              size="lg"
              color="var(--kiwi-colors-surface-on-surface)"
              className={styles.closeButton}
              onClick={handleClose}
            />
            <div className={styles.container} ref={setContentRef}>
              <div className={styles.stepperContainer}>
                <VerticalLinearStepper activeStep={activeStep} />
                <div className={styles.helpCenter}>
                  <Divider className={styles.divider} />
                  <div className={styles.helpCenterContent}>
                    <Text type="label" size="sm" color="var(--kiwi-colors-surface-on-surface-low)">
                      {t('checkoutModal.helpCenter.title')}
                    </Text>
                    <Link
                      href={`${CONTACT_SUPPORT_URL}?from=checkout-on-viewer`}
                      target="_blank"
                      className={styles.helpCenterLink}
                      rel="noopener noreferrer"
                      data-lumin-btn-name={ButtonName.CONTACT_US}
                      data-lumin-btn-purpose={ButtonPurpose[ButtonName.CONTACT_US]}
                    >
                      {t('checkoutModal.helpCenter.cta')}
                    </Link>
                  </div>
                </div>
              </div>
              <div className={styles.rightContainer}>
                <div style={{ display: activeStep === 1 ? 'block' : 'none' }}>
                  <PaymentDetail />
                </div>
                {currentStepMap.find((step) => step.step === activeStep)?.component}
                <BillingInfo
                  setActiveStep={setActiveStep}
                  activeStep={activeStep}
                  trackModalConfirmation={trackModalConfirmation}
                  handleSuccess={() => setOpenBillingModal(false)}
                  handleFailure={handleFailure}
                  organization={organization}
                />
              </div>
            </div>
          </CheckoutModalWithStripeElements>
        </CheckoutModalContext.Provider>
      </GoogleReCaptchaV3Provider>
    </Dialog>
  );
};
export default withGetPaymentInfo(CheckoutModal);
