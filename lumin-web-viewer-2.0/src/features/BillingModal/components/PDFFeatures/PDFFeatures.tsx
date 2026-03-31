import { Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { PLAN_TYPE_LABEL, Plans } from 'constants/plan';

import styles from './PDFFeatures.module.scss';

const FEATURES_MAP = {
  [Plans.ORG_STARTER]: [
    {
      icon: 'ph-chart-line-up',
      label: 'pdfFeatures.organizationInsights',
    },
    {
      icon: 'ph-infinity',
      label: 'pdfFeatures.foreverDocumentAccess',
    },
  ],
  [Plans.ORG_PRO]: [
    {
      icon: 'ph-split-horizontal',
      label: 'pdfFeatures.splitDocuments',
    },
    {
      icon: 'ph-pencil-simple-line',
      label: 'pdfFeatures.editPDFText',
    },
  ],
  [Plans.ORG_BUSINESS]: [
    {
      icon: 'lm-forms',
      label: 'pdfFeatures.addFillableFields',
    },
    {
      icon: 'lm-file-censor',
      label: 'pdfFeatures.redaction',
    },
  ],
};

const PDFFeatures = ({ plan }: { plan: keyof typeof FEATURES_MAP }) => {
  const { t } = useTranslation();
  const features = FEATURES_MAP[plan];

  const featuresDescription = {
    [Plans.ORG_STARTER]: t('pdfFeatures.allBasicFeaturesPlus'),
    [Plans.ORG_PRO]: t('pdfFeatures.allFeaturesPlus', {
      plan: PLAN_TYPE_LABEL[Plans.ORG_STARTER as keyof typeof PLAN_TYPE_LABEL],
    }),
    [Plans.ORG_BUSINESS]: t('pdfFeatures.allFeaturesPlus', {
      plan: PLAN_TYPE_LABEL[Plans.ORG_PRO as keyof typeof PLAN_TYPE_LABEL],
    }),
  };

  return (
    <div className={styles.featuresWrapper}>
      <p className={styles.featuresText}>{featuresDescription[plan]}</p>
      <div className={styles.featuresList}>
        {features.map((feature) => (
          <div className={styles.featureItem} key={feature.label}>
            <div className={styles.featureItemIcon}>
              <Icomoon type={feature.icon} size="sm" />
            </div>
            <Text size="md" type="body">
              {t(feature.label)}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFFeatures;
