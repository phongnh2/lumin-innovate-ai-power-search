import { Text, TextInput } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';
import { Trans } from 'react-i18next';

import PaymentSwitchComponent from 'luminComponents/PaymentSwitchComponent';

import { useTranslation } from 'hooks';

import { CHECKOUT_ON_VIEWER_VARIANT } from 'features/CNC/hooks/useOpenCheckoutOnViewer';

import { NUMBER_OF_MONTHS_IN_YEAR } from 'constants/commonConstant';
import { PERIOD, PRICE } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';

import PlanInfo from './components/PlanInfo';
import { CheckoutModalContext } from '../../context/CheckoutModalContext';
import { OrgPlan, PeriodType } from '../../interface';

import styles from './PeriodSelection.module.scss';

type Props = {
  periodList: PeriodType[];
  currentOrganization: IOrganization;
  documentName: string;
};

const PeriodSelection = ({ periodList, currentOrganization, documentName }: Props) => {
  const { t } = useTranslation();
  const { billingInfo, setBillingInfo } = useContext(CheckoutModalContext);
  const planValue = billingInfo.plan as OrgPlan;
  const onPeriodChange = (_period: string) => {
    setBillingInfo((prev) => ({ ...prev, period: _period }));
  };
  const unitPrice = PRICE.V3[PERIOD.ANNUAL as keyof typeof PRICE.V3][planValue] / NUMBER_OF_MONTHS_IN_YEAR;

  return (
    <div className={styles.container}>
      <div>
        <Text type="headline" size="sm" className={styles.periodTitle}>
          {t('plan.title')}
        </Text>
        <PaymentSwitchComponent
          radioList={periodList}
          period={billingInfo.period}
          onChange={onPeriodChange}
          unitPrice={unitPrice}
          currency={billingInfo.currency}
          from={CHECKOUT_ON_VIEWER_VARIANT.MODAL}
        />
      </div>
      <div className={styles.orgInfoContainer}>
        <Text type="headline" size="sm">
          {t('common.circle')}
        </Text>
        <TextInput value={currentOrganization?.name} readOnly size="lg" className={styles.orgInfo} />
        <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
          <Trans
            i18nKey="checkoutModal.documentInfo.title"
            values={{ documentName, workspaceName: currentOrganization.name }}
          />
        </Text>
      </div>
      <PlanInfo />
    </div>
  );
};

export default PeriodSelection;
