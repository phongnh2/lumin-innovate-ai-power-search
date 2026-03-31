import { find } from 'lodash';
import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import useGetInfoPlan from 'lumin-components/OrganizationFreeTrial/hooks/useGetInfoPlan';
import { getRadioButtons } from 'luminComponents/OrganizationFreeTrial/OrganizationFreeTrial';

import { useGetOrganizationList, useTranslation } from 'hooks';

import { EVENT_FIELD_ACTION, EVENT_FIELD_NAME } from 'utils/Factory/EventCollection/PaymentEventCollection';
import { PaymentUtilities } from 'utils/Factory/Payment';
import { eventTracking } from 'utils/recordUtil';

import { BILLING_FORM_STEP } from 'features/BillingModal/constants/billingModal';
import { useBillingFormContext } from 'features/BillingModal/hooks/useBillingFormContext';
import { useClaimFreeTrial } from 'features/BillingModal/hooks/useClaimFreeTrial';
import { useTrialModalContext } from 'features/BillingModal/hooks/useTrialModalContext';
import { VARIATION_NAME } from 'features/CNC/constants/events/variation';

import { AWS_EVENTS } from 'constants/awsEvents';
import { DEFAULT_FREE_TRIAL_CURRENCY } from 'constants/paymentConstant';
import { PaymentCurrency, PaymentPeriod } from 'constants/plan.enum';

import { IOrganizationPayment } from 'interfaces/payment/payment.interface';

import PaymentElementForm from '../PaymentElementForm';
import PDFPlanInfo from '../PDFPlanInfo';
import PeriodRadioList from '../PeriodRadioList';
import WorkspaceInfo from '../WorkspaceInfo';

import styles from './BillingForm.module.scss';

const BillingForm = () => {
  const { t } = useTranslation();
  const { setBillingInfo, billingInfo, setIsFetchedCard, currentPaymentMethod, billingFormStep } =
    useTrialModalContext();
  const { getNewSecret, hasClientSecret, newOrganization, setNewOrganization } = useBillingFormContext();
  const { period, organization } = billingInfo;

  const { trackUserFillPaymentForm } = useClaimFreeTrial({ newOrganization });
  const organizations = useGetOrganizationList().organizationList.map(({ organization: org }) => org);

  const { description } = useGetInfoPlan({ currency: billingInfo.currency });
  const radioButtons = getRadioButtons(t);
  const radioList = radioButtons.map((radio, index) => ({ ...radio, description: description[index] })).reverse();

  const onPeriodChange = (_period: PaymentPeriod) => {
    eventTracking(AWS_EVENTS.PAYMENT.PAYMENT_PERIOD_CHANGED, {
      selectedPaymentPeriod: _period.toLowerCase(),
      variationName: VARIATION_NAME.CHECKOUT_ON_VIEWER_WEB_POP_OVER,
    }).catch(() => {});
    setBillingInfo((prev) => ({
      ...prev,
      period: _period,
    }));
  };

  const onOrganizationSelect = (item: { payment: IOrganizationPayment; value: string }) => {
    const paymentUtilities = new PaymentUtilities(item.payment);
    if (!hasClientSecret && currentPaymentMethod && paymentUtilities.isFree()) {
      getNewSecret();
    }
    setIsFetchedCard(false);
    trackUserFillPaymentForm({ fieldName: EVENT_FIELD_NAME.CIRCLE_DROPDOWN, action: EVENT_FIELD_ACTION.COMPLETED });
    const currency = item.payment.currency || DEFAULT_FREE_TRIAL_CURRENCY;
    const currentOrganization = find(organizations, { _id: item.value });
    setBillingInfo((prev) => ({
      ...prev,
      organizationId: item.value,
      currency: currency as PaymentCurrency,
      organization: currentOrganization,
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper} data-hidden={billingFormStep !== BILLING_FORM_STEP.WORKSPACE_INFO}>
        <Text size="lg" type="headline">
          {t('payment.title')}
        </Text>
        <div className={styles.sectionContainer}>
          <WorkspaceInfo
            onOrganizationSelect={onOrganizationSelect}
            currentOrganization={organization}
            newOrganization={newOrganization}
            setNewOrganization={setNewOrganization}
            selectProps={{
              readOnly: true,
              tabIndex: -1,
            }}
          />
          <PeriodRadioList radioList={radioList} period={period} onChange={onPeriodChange} />
        </div>
        <PDFPlanInfo />
      </div>
      {!currentPaymentMethod && (
        <div className={styles.wrapper} data-hidden={billingFormStep !== BILLING_FORM_STEP.PAYMENT_ELEMENT_FORM}>
          <PaymentElementForm />
        </div>
      )}
    </div>
  );
};

export default BillingForm;
