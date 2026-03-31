import {
  Text,
  IconButton,
  Divider,
  Button,
  Icomoon as KiwiIcomoon,
  PlainTooltip,
  InlineMessage,
} from 'lumin-ui/kiwi-ui';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import PaymentMethodInfoForm from 'luminComponents/PaymentMethodInfo/PaymentMethodInfoForm';

import { useRemovePaymentCard, useTranslation, useMobileMatch } from 'hooks';

import { commonUtils } from 'utils';

import { PaymentTypes } from 'constants/plan.enum';

import { ICustomerInfo, IPaymentMethod } from 'interfaces/payment/payment.interface';

import { CardForm } from './CardForm';
import { useSettingBillingFormContext } from '../context/SettingBillingFormContext';
import { SelectedOrgBilling } from '../SettingBillingForm.interface';

import styles from './CreditCard.module.scss';

type Params = {
  selectedBilling: SelectedOrgBilling;
  currentPaymentMethod: IPaymentMethod;
  setCurrentPaymentMethod: Dispatch<SetStateAction<IPaymentMethod>>;
  hasAttemptWarning: boolean;
  onSave: (callback?: () => Promise<string | null>) => Promise<void>;
  customerInfo: ICustomerInfo;
};

const CreditCard = ({
  selectedBilling,
  currentPaymentMethod,
  setCurrentPaymentMethod,
  hasAttemptWarning,
  onSave,
  customerInfo,
}: Params): JSX.Element => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const { isChangingCard, setIsChangingCard, paymentMethodError, setPaymentMethodError } =
    useSettingBillingFormContext();

  const { removePaymentCard } = useRemovePaymentCard({
    selectedItem: selectedBilling,
    setPaymentMethodError,
    setCurrentPaymentMethod,
  });
  const isMobile = useMobileMatch();
  const organizationId = selectedBilling.type === PaymentTypes.ORGANIZATION ? selectedBilling._id : null;

  useEffect(() => {
    if (currentPaymentMethod && searchParams.get('edit') && location.hash === '#billing-info') {
      setIsChangingCard(true);

      const params = new URLSearchParams(searchParams);
      params.delete('edit');
      setSearchParams(params);
    }
  }, [currentPaymentMethod]);

  const renderAddNewCard = (): JSX.Element => (
    <Button
      className={styles.addNewCardBtn}
      maw={isMobile ? '100%' : 320}
      w="100%"
      size="lg"
      variant="outlined"
      data-cy="add_payment_method_cta"
      onClick={() => setIsChangingCard(true)}
    >
      <KiwiIcomoon size="lg" type="plus-lg" />
      <Text type="label" size="lg">
        {t('orgDashboardBilling.addPaymentMethod')}
      </Text>
    </Button>
  );

  const renderCard = (): JSX.Element => {
    if (!currentPaymentMethod && !isChangingCard) {
      return renderAddNewCard();
    }
    if (isChangingCard) {
      return (
        <div className={styles.creditCardWrapper}>
          {isChangingCard && paymentMethodError && (
            <InlineMessage className={styles.errorMessage} type="error" message={paymentMethodError} />
          )}
          <CardForm
            selectedBilling={selectedBilling}
            customerEmail={customerInfo?.email}
            hasAttemptWarning={hasAttemptWarning}
            onSave={onSave}
            organizationId={organizationId}
          />
        </div>
      );
    }
    return (
      <div className={styles.creditCardContainer}>
        <div className={styles.paymentMethodWrapper}>
          <PaymentMethodInfoForm paymentMethod={currentPaymentMethod} isEnableReskin />
        </div>
        <div className={styles.actionButtonsWrapper}>
          <IconButton
            onClick={() => setIsChangingCard(true)}
            size="lg"
            icon="pencil-lg"
            data-cy="change_payment_method_cta"
          />
          <Divider orientation="vertical" h={20} />
          <PlainTooltip content={t('orgDashboardBilling.removePaymentMethod')}>
            <IconButton onClick={removePaymentCard} size="lg" icon="trash-lg" data-cy="remove_payment_method_cta" />
          </PlainTooltip>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {!isChangingCard && (
        <Text className={styles.label} type="title" size="sm">
          {commonUtils.formatTitleCaseByLocale(t('payment.paymentMethod'))}
        </Text>
      )}
      {renderCard()}
    </div>
  );
};

export default CreditCard;
