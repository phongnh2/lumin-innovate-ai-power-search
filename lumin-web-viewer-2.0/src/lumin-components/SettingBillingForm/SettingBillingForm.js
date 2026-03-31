import { Text, TextInput, Button, IconButton } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { useUpdateEffect } from 'react-use';

import selectors from 'selectors';

import { WarningBannerContext } from 'src/HOC/withWarningBanner';

import { useMobileMatch, useTranslation } from 'hooks';
import useRestrictBillingActions from 'hooks/useRestrictBillingActions';
import { useRetrySubscription } from 'hooks/useRetrySubscription';

import paymentService from 'services/paymentService';

import logger from 'helpers/logger';

import { commonUtils, toastUtils, validator } from 'utils';

import { useUnifyBillingSubscriptionStore } from 'features/UnifyBillingSubscription/hooks';

import { WarningBannerType } from 'constants/banner';
import { ERROR_MESSAGE_INVALID_FIELD, ERROR_MESSAGE_EMAIL_LENGTH } from 'constants/messages';
import { BillingWarningType } from 'constants/paymentConstant';
import { PaymentStatus } from 'constants/plan.enum';
import { MAX_EMAIL_LENGTH } from 'constants/userConstants';

import CreditCard from './components/CreditCard';
import { SettingBillingFormContext } from './context/SettingBillingFormContext';

import styles from './SettingBillingForm.module.scss';

SettingBillingForm.propTypes = {
  selectedBilling: PropTypes.object,
  setDirty: PropTypes.func,
  setCurrentPaymentMethod: PropTypes.func.isRequired,
  currentPaymentMethod: PropTypes.object,
  customerInfo: PropTypes.object,
  setCustomerInfo: PropTypes.func.isRequired,
};

SettingBillingForm.defaultProps = {
  selectedBilling: {},
  setDirty: () => {},
  currentPaymentMethod: {},
  customerInfo: {},
};

const getErrorMessage = ({ email = '', t }) => {
  if (!email.trim().length) {
    return t('errorMessage.fieldRequired');
  }
  if (email.trim().length > MAX_EMAIL_LENGTH) {
    return t(ERROR_MESSAGE_EMAIL_LENGTH.key, ERROR_MESSAGE_EMAIL_LENGTH.interpolation);
  }
  if (!validator.validateEmail(email)) {
    return t(ERROR_MESSAGE_INVALID_FIELD);
  }
  return '';
};

const FAILED_STATUS = [PaymentStatus.PENDING, PaymentStatus.UNPAID];

function SettingBillingForm({
  currentPaymentMethod,
  selectedBilling,
  setDirty,
  setCurrentPaymentMethod,
  customerInfo,
  setCustomerInfo,
}) {
  const { email: userEmail } = useSelector(selectors.getCurrentUser, shallowEqual);
  const { _id: clientId, type } = selectedBilling;
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingCard, setIsChangingCard] = useState(false);
  const [email, setEmail] = useState(customerInfo?.email);
  const [savingBillingInfo, setSavingBillingInfo] = useState(false);
  const [paymentMethodError, setPaymentMethodError] = useState('');
  const contextValue = useContext(WarningBannerContext);
  const { refetch: refetchBillingWarning, checkHasWarning } = contextValue[WarningBannerType.BILLING_WARNING.value];
  const { isRestrictedOrg, openRestrictActionsModal } = useRestrictBillingActions({ orgId: clientId });
  const isMobile = useMobileMatch();

  const inputRef = useRef(null);

  const hasAttemptWarning = checkHasWarning(clientId, BillingWarningType.RENEW_ATTEMPT);

  const [validation, setValidation] = useState({
    errorMessage: '',
  });
  const { t } = useTranslation();

  const { setSubscriptionData, subscription } = useUnifyBillingSubscriptionStore();

  const hasFailedStatus = useMemo(() => {
    if (!subscription?.payment) {
      return false;
    }
    const { payment } = subscription;
    return (
      FAILED_STATUS.includes(payment.type) ||
      payment.subscriptionItems.some((subItem) => FAILED_STATUS.includes(subItem.paymentStatus))
    );
  }, [subscription]);

  const { onRetry: retrySubscription } = useRetrySubscription(clientId, type, {
    skippedWarnings: hasFailedStatus ? [BillingWarningType.RENEW_ATTEMPT, BillingWarningType.UNPAID_SUBSCRIPTION] : [],
  });

  useEffect(() => {
    if (isChangingCard) {
      setIsChangingEmail(false);
    } else {
      setDirty(false);
    }
    setValidation({
      errorMessage: '',
    });
  }, [isChangingCard, setDirty]);

  useEffect(() => {
    if (isChangingEmail) {
      setIsChangingCard(false);
    } else {
      setEmail(customerInfo?.email);
    }
    setValidation({
      errorMessage: '',
    });
  }, [isChangingEmail, customerInfo?.email]);

  useEffect(() => {
    setDirty(isChangingEmail && customerInfo?.email !== email);
  }, [isChangingEmail, customerInfo?.email, email, setDirty]);

  useUpdateEffect(() => {
    refetchBillingWarning(clientId, type);
  }, [clientId, type]);

  useEffect(() => {
    if (isChangingEmail) {
      inputRef.current?.focus();
    }
  }, [isChangingEmail]);

  const getUpdateSubscription = () => {
    const { payment } = subscription;

    if (!hasFailedStatus) {
      return subscription;
    }

    const updatedItems = payment.subscriptionItems.map((item) =>
      FAILED_STATUS.includes(item.paymentStatus) ? { ...item, paymentStatus: PaymentStatus.ACTIVE } : item
    );

    return {
      ...subscription,
      payment: {
        ...payment,
        status: PaymentStatus.ACTIVE,
        subscriptionItems: updatedItems,
      },
    };
  };

  /**
   * @callback callback
   * @returns {Promise<string | null>} paymentMethodId
   */

  /**
   * @param {callback} [callback]
   */
  const _onSave = async (callback) => {
    if (isRestrictedOrg) {
      openRestrictActionsModal();
      return;
    }
    let paymentMethodId = '';
    const newEmail = email?.toLowerCase() || userEmail.toLowerCase();
    if (isChangingEmail && (!validator.validateEmail(newEmail) || newEmail === customerInfo.email)) {
      return;
    }
    setSavingBillingInfo(true);
    if (callback) {
      paymentMethodId = await callback();
      if (!paymentMethodId) {
        return;
      }
    }
    try {
      const data = await paymentService.updatePaymentMethod({
        clientId,
        paymentMethodId,
        email: newEmail,
        type,
      });
      toastUtils.success({
        message: t('orgDashboardBilling.billingInformationUpdated'),
      });
      if (hasAttemptWarning) {
        await retrySubscription();
        if (subscription?.payment) {
          const updatedSubscription = getUpdateSubscription();
          setSubscriptionData(updatedSubscription);
        }
      } else {
        refetchBillingWarning(clientId, type);
      }
      unstable_batchedUpdates(() => {
        setCurrentPaymentMethod(data.paymentMethod);
        setEmail(data.billingEmail);
        setIsChangingCard(false);
        setIsChangingEmail(false);
        setCustomerInfo((prev) => ({ ...prev, email: data.billingEmail }));
        setPaymentMethodError('');
      });
    } catch (error) {
      if (!hasAttemptWarning) {
        toastUtils.error({
          message: error.graphQLErrors[0].message,
        });
        logger.logError({ error });
      }
    } finally {
      setSavingBillingInfo(false);
    }
  };

  const formatTitle = (text) => commonUtils.formatTitleCaseByLocale(text);

  const renderBillingEmail = () => (
    <div className={styles.billingEmailContainer}>
      <Text className={styles.label} type="title" size="sm">
        {formatTitle(t('orgDashboardBilling.billingEmail'))}
      </Text>
      <div className={styles.billingEmailInputWrapper} data-is-editing={isChangingEmail}>
        <TextInput
          ref={inputRef}
          size="lg"
          w="100%"
          data-cy="billing_email_input"
          maw={isMobile ? '100%' : 320}
          value={isChangingEmail ? email : customerInfo?.email}
          placeholder={t('common.eg', { egText: 'Lisa Barney' })}
          onChange={(e) => {
            setEmail(e.target.value);
            setValidation({
              errorMessage: getErrorMessage({ email: e.target.value, t }),
            });
          }}
          error={validation.errorMessage}
          readOnly={!isChangingEmail}
        />
        {isChangingEmail ? (
          <div className={styles.actionButtonsWrapper} data-is-editing={isChangingEmail}>
            <Button
              size="lg"
              variant="outlined"
              data-cy="cancel_change_email_cta"
              onClick={() => setIsChangingEmail(false)}
              disabled={savingBillingInfo}
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="lg"
              variant="filled"
              data-cy="submit_change_email_cta"
              onClick={() => _onSave()}
              loading={savingBillingInfo}
              disabled={
                savingBillingInfo ||
                !validator.validateEmail(email) ||
                !validator.validateEmailLength(email) ||
                email === customerInfo?.email
              }
            >
              {t('common.save')}
            </Button>
          </div>
        ) : (
          <IconButton size="lg" icon="pencil-lg" data-cy="change_email_cta" onClick={() => setIsChangingEmail(true)} />
        )}
      </div>
    </div>
  );

  const settingBillingFormContextValue = useMemo(
    () => ({
      isChangingCard,
      setIsChangingCard,
      savingBillingInfo,
      setSavingBillingInfo,
      paymentMethodError,
      setPaymentMethodError,
    }),
    [paymentMethodError, isChangingCard, savingBillingInfo]
  );

  return (
    <SettingBillingFormContext.Provider value={settingBillingFormContextValue}>
      <div className={styles.container}>
        <Text
          className={styles.title}
          id="billing-info"
          type="headline"
          size="md"
          color="var(--kiwi-colors-surface-on-surface)"
        >
          {formatTitle(t('common.billingInfo'))}
        </Text>
        {renderBillingEmail()}
        <CreditCard
          selectedBilling={selectedBilling}
          currentPaymentMethod={currentPaymentMethod}
          setCurrentPaymentMethod={setCurrentPaymentMethod}
          hasAttemptWarning={hasAttemptWarning}
          customerInfo={customerInfo}
          onSave={_onSave}
        />
      </div>
    </SettingBillingFormContext.Provider>
  );
}

export default SettingBillingForm;
