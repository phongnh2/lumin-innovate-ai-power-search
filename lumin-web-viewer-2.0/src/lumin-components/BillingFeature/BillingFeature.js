import { Text, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'lumin-components/Icomoon';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { Colors } from 'constants/lumin-common';
import { PaymentTypes, Plans } from 'constants/plan';

import { FEATURES } from '../../screens/Plan/PlanConstant';

import * as Styled from './BillingFeature.styled';

import styles from './BillingFeature.module.scss';

function BillingFeature({ plan }) {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const features = FEATURES[plan];

  const renderFeatureHighlight = (features, isReskin) =>
    features.map((feature) =>
      isReskin ? (
        <li key={feature} className={styles.featureItem}>
          <KiwiIcomoon type="sparkles-sm" size="sm" />
          <Text type="body" size="md">
            {t(feature)}
          </Text>
        </li>
      ) : (
        <Styled.Item key={feature}>
          <Icomoon className="check" size={16} color={Colors.SECONDARY_50} />
          <span>{t(feature)}</span>
        </Styled.Item>
      )
    );

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Text type="headline" size="sm" color="var(--kiwi-colors-add-on-on-primary-fixed-variant)">
            {t('payment.features')}
          </Text>
          <Text type="body" size="md">
            {t('payment.allBasicFunctionsPlus')}
          </Text>
        </div>
        <ul className={styles.listFeatures}>{renderFeatureHighlight(features, true)}</ul>
      </div>
    );
  }

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.Title>{t('payment.features')}</Styled.Title>
        {t('payment.allBasicFunctionsPlus')}
      </Styled.Header>
      <Styled.List>{renderFeatureHighlight(features)}</Styled.List>
    </Styled.Container>
  );
}

BillingFeature.propTypes = {
  plan: PropTypes.oneOf([...Object.values(Plans), ...Object.values(PaymentTypes)]).isRequired,
};

export default BillingFeature;
