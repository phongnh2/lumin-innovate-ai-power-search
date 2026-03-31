import { t } from 'i18next';
import { difference } from 'lodash';
import React from 'react';
import { Trans } from 'react-i18next';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { ORG_PLAN_TYPE, Plans } from 'constants/plan';
import { PaymentStatus } from 'constants/plan.enum';
import { STATIC_PAGE_URL } from 'constants/urls';

import { IPayment, SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import styles from './EnterpriseOrgOffer.module.scss';

type Props = {
  payment: IPayment;
  subscriptionItem?: SubScriptionItemWithAmount;
};

const PREMIUM_PLANS = difference(Object.values(ORG_PLAN_TYPE), [Plans.FREE, Plans.ENTERPRISE]);

function EnterpriseOrgOffer({ subscriptionItem, payment }: Props): JSX.Element {
  const { paymentType, paymentStatus } = subscriptionItem || {};
  const isUsePremiumExceptEnterprise = PREMIUM_PLANS.includes(payment.type) || PREMIUM_PLANS.includes(paymentType);
  const showEnterprise =
    isUsePremiumExceptEnterprise && (payment.status === PaymentStatus.ACTIVE || paymentStatus === PaymentStatus.ACTIVE);

  if (!showEnterprise) {
    return null;
  }

  const link = STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSale'));

  return (
    <p className={styles.text}>
      <Trans
        i18nKey="settingBilling.enterpriseAdvertisement"
        components={{
          Link: (
            // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
            <a className={styles.link} href={link} target="_blank" rel="noreferrer" />
          ),
        }}
      />
    </p>
  );
}

export default EnterpriseOrgOffer;
