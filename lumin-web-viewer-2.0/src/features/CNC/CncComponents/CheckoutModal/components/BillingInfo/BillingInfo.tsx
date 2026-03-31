import { Button, ButtonVariant, Text } from 'lumin-ui/kiwi-ui';
import React, { Dispatch, SetStateAction, useContext, useMemo } from 'react';
import { Trans } from 'react-i18next';

import tadaIcon from 'assets/lumin-svgs/tada.svg';

import { useTranslation } from 'hooks';

import { numberUtils, paymentUtil } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import useClaimFreeTrial from 'features/CNC/CncComponents/CheckoutModal/hooks/useClaimFreeTrial';

import { ORG_TEXT } from 'constants/organizationConstants';
import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import { PRICE } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { CheckoutModalContext } from '../../context/CheckoutModalContext';
import { OrgPlan } from '../../interface';

import styles from './BillingInfo.module.scss';

interface BillingInfoProps {
  setActiveStep: Dispatch<SetStateAction<number>>;
  activeStep: number;
  trackModalConfirmation: () => Promise<void>;
  handleSuccess?: () => void;
  handleFailure?: ({ callback }: { callback?: () => void }) => void;
  organization: IOrganization;
}

const BillingInfo = ({
  setActiveStep,
  activeStep,
  trackModalConfirmation,
  handleSuccess = () => {},
  handleFailure = () => {},
  organization,
}: BillingInfoProps) => {
  const { t } = useTranslation();
  const shouldShowBackButton = activeStep > 0;
  const { billingInfo } = useContext(CheckoutModalContext);
  const planValue = billingInfo.plan as OrgPlan;
  const currencySymbol = paymentUtil.convertCurrencySymbol(billingInfo.currency);
  const amount = PRICE.V3[billingInfo.period as keyof typeof PRICE.V3][planValue];

  const { name: orgName, url } = organization;
  const buttonLabels = useMemo(
    () => ({
      [ButtonName.CONTINUE]: `Continue at step ${activeStep + 1} in modal Checkout on Viewer`,
      [ButtonName.BACK]: `Back at step ${activeStep + 1} in modal Checkout on Viewer`,
    }),
    [activeStep]
  );

  const { onClaim, isProcessing, canClaimTrial } = useClaimFreeTrial({
    onSuccess: handleSuccess,
    successModalContent: {
      icon: <img src={tadaIcon} alt="tada" className={styles.image} />,
      title: <p style={{ textAlign: 'center' }}>{t('freeTrialPage.freeTrialActivated')}</p>,
      message: (
        <div>
          <Trans
            i18nKey="freeTrialPage.freeTrialActivatedMessage"
            values={{
              orgName,
              freeTrialDays: FREE_TRIAL_DAYS,
            }}
            components={{
              b: <b className="kiwi-message--primary" />,
              br: <br />,
              a: (
                // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                <a
                  href={`/${ORG_TEXT}/${url}/dashboard/billing`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kiwi-message--primary"
                  style={{ textDecoration: 'underline' }}
                />
              ),
            }}
          />
        </div>
      ),
    },
    onFailure: handleFailure,
  });
  const disableContinueButton =
    (activeStep === 1 && !billingInfo.isCardFilled) || isProcessing || (activeStep === 2 && !canClaimTrial);

  const handleContinue = async () => {
    if (activeStep === 2) {
      trackModalConfirmation().catch(() => {});
      await onClaim();
      return;
    }
    setActiveStep((prev: number) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev: number) => prev - 1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.textWrapper}>
        <Text type="headline" size="lg" color="var(--kiwi-colors-core-on-primary-container)">
          <Trans i18nKey="checkoutModal.billingInfo.title" values={{ currencySymbol }} />
        </Text>
        <Text type="label" size="sm" color="var(--kiwi-colors-surface-on-surface-low)">
          <Trans
            i18nKey="checkoutModal.billingInfo.description"
            values={{
              currencySymbol,
              amount: numberUtils.formatDecimal(amount),
              period: billingInfo.period.toLowerCase(),
            }}
          />
        </Text>
      </div>
      <div className={styles.buttonWrapper}>
        {shouldShowBackButton && (
          <Button
            type="button"
            size="lg"
            variant={ButtonVariant.outlined}
            onClick={handleBack}
            data-lumin-btn-name={ButtonName.BACK}
            data-lumin-btn-purpose={buttonLabels[ButtonName.BACK]}
          >
            {t('common.back')}
          </Button>
        )}
        <Button
          type="button"
          size="lg"
          variant={ButtonVariant.filled}
          disabled={disableContinueButton}
          onClick={handleContinue}
          data-lumin-btn-name={ButtonName.CONTINUE}
          data-lumin-btn-purpose={buttonLabels[ButtonName.CONTINUE]}
          loading={isProcessing}
        >
          {activeStep === 2 ? t('checkoutModal.claimFreeTrial.title') : t('common.continue')}
        </Button>
      </div>
    </div>
  );
};

export default BillingInfo;
