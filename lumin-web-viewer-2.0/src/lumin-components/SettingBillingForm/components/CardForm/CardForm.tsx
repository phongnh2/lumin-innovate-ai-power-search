import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { Divider, Button } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import ButtonMaterial, { ButtonColor, ButtonSize } from 'lumin-components/ButtonMaterial';
import { useSettingBillingFormContext } from 'luminComponents/SettingBillingForm/context/SettingBillingFormContext';

import withStripeElements from 'HOC/withStripeElements';

import { useEnableWebReskin, useMobileMatch, useTranslation } from 'hooks';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { paymentServices } from 'services';
import paymentService from 'services/paymentService';

import { PaymentTypes } from 'constants/plan.enum';
import { BASEURL } from 'constants/urls';

import { SelectedOrgBilling } from '../../SettingBillingForm.interface';
import * as Styled from '../../SettingBillingForm.styled';

import styles from './CardForm.module.scss';

export interface CardFormProps {
  selectedBilling: SelectedOrgBilling;
  customerEmail: string;
  hasAttemptWarning: boolean;
  onSave: (callback?: () => Promise<string | null>) => Promise<void>;
  organizationId: string;
  stripeAccountId: string;
}

const CardForm = (props: CardFormProps) => {
  const { onSave, hasAttemptWarning, selectedBilling, stripeAccountId, customerEmail } = props;

  const { _id: selectedOrgId, type: planType } = selectedBilling;

  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const currentUser = useGetCurrentUser();
  const isMobile = useMobileMatch();

  const { isChangingCard, setIsChangingCard, savingBillingInfo, setSavingBillingInfo, setPaymentMethodError } =
    useSettingBillingFormContext();

  const [isCardFilled, setIsCardFilled] = useState<boolean>(false);

  const { isEnableReskin } = useEnableWebReskin();

  const onElementsChange = (e: StripePaymentElementChangeEvent): void => {
    setIsCardFilled(e.complete);
  };

  const closeEditingCardInfo = (): void => {
    unstable_batchedUpdates(() => {
      setIsChangingCard(false);
      setPaymentMethodError('');
    });
  };

  const onElementsReady = () => {
    const paymentElement = elements.getElement('payment');
    if (isChangingCard) {
      paymentElement.focus();
    }
  };

  const deactivateSetupIntent = async () => {
    if (planType === PaymentTypes.ORGANIZATION) {
      await paymentService.deactivateOrganizationSetupIntent({
        orgId: selectedOrgId,
        stripeAccountId,
      });
    } else {
      await paymentServices.deactivateSetupIntent({ stripeAccountId });
    }
  };

  const onSaveChangeCard = async (): Promise<string | null> => {
    const { error, setupIntent } = await stripe
      .confirmSetup({
        elements,
        redirect: 'if_required',
        confirmParams: {
          payment_method_data: {
            billing_details: {
              email: customerEmail,
            },
          },
          return_url: BASEURL,
        },
      })
      .finally(async () => {
        await deactivateSetupIntent();
      });
    if (error) {
      setPaymentMethodError(error.message);
      setSavingBillingInfo(false);
      return null;
    }
    if (setupIntent.status !== 'succeeded') {
      setPaymentMethodError(
        'We are unable to authenticate your payment method. Please choose a different payment method and try again.'
      );
      setSavingBillingInfo(false);
      return null;
    }
    return setupIntent.payment_method as string;
  };

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <PaymentElement
          id="payment-element"
          onReady={onElementsReady}
          onChange={onElementsChange}
          options={{
            fields: {
              billingDetails: {
                address: {
                  postalCode: 'auto',
                },
              },
            },
            defaultValues: {
              billingDetails: {
                email: currentUser.email,
              },
            },
          }}
        />
        <Divider my="var(--kiwi-spacing-2)" />
        <div className={styles.actionButtonsWrapper}>
          <Button
            fullWidth={isMobile}
            size="lg"
            variant="outlined"
            data-cy="cancel_change_payment_method_cta"
            onClick={closeEditingCardInfo}
            disabled={savingBillingInfo}
          >
            {t('common.cancel')}
          </Button>
          <Button
            fullWidth={isMobile}
            size="lg"
            variant="filled"
            data-cy="submit_change_payment_method_cta"
            onClick={() => onSave(onSaveChangeCard)}
            loading={savingBillingInfo}
            disabled={savingBillingInfo || !isCardFilled}
          >
            {hasAttemptWarning ? t('orgDashboardBilling.saveRetry') : t('common.save')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Styled.PaymentElementContainer>
        <PaymentElement
          id="payment-element"
          onReady={onElementsReady}
          onChange={onElementsChange}
          options={{
            fields: {
              billingDetails: {
                address: {
                  postalCode: 'auto',
                },
              },
            },
            defaultValues: {
              billingDetails: {
                email: currentUser.email,
              },
            },
          }}
        />
      </Styled.PaymentElementContainer>
      <Styled.ButtonWrapper>
        <ButtonMaterial
          color={ButtonColor.TERTIARY}
          size={ButtonSize.XL}
          onClick={closeEditingCardInfo}
          disabled={savingBillingInfo}
        >
          {t('common.cancel')}
        </ButtonMaterial>
        <ButtonMaterial
          size={ButtonSize.XL}
          onClick={() => onSave(onSaveChangeCard)}
          loading={savingBillingInfo}
          disabled={savingBillingInfo || !isCardFilled}
        >
          {hasAttemptWarning ? t('orgDashboardBilling.saveRetry') : t('common.save')}
        </ButtonMaterial>
      </Styled.ButtonWrapper>
    </>
  );
};

export default withStripeElements<CardFormProps>(CardForm, { action: 'change_card', noTopGapLoading: true });
