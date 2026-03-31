import { Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { STATIC_PAGE_URL } from 'constants/urls';

import styles from './PaymentEncryptedCert.module.scss';

const PaymentEncryptedCert = () => {
  const { t } = useTranslation();
  const itemList = [
    {
      key: 'termsAndConditions',
      label: (
        <Trans
          i18nKey="freeTrialPage.termsAndConditions"
          components={{
            1: (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={STATIC_PAGE_URL + getFullPathWithPresetLang('/terms-of-use')}
                className={styles.link}
              />
            ),
          }}
        />
      ),
    },
    {
      key: 'messagePaymentFreeTrial',
      label: t('freeTrialPage.messagePaymentFreeTrial'),
    },
  ];
  return (
    <div className={styles.container}>
      {itemList.map((item) => (
        <div className={styles.itemsWrapper} key={item.key}>
          <Icomoon type="ph-checks" size="md" />
          <Text type="body" size="sm">
            {item.label}
          </Text>
        </div>
      ))}
    </div>
  );
};

export default PaymentEncryptedCert;
