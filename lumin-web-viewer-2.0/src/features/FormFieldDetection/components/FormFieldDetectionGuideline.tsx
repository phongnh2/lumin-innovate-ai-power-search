import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import IconButton from '@new-ui/general-components/IconButton';

import styles from './FormFieldDetection.module.scss';

interface IFormFieldDetectionGuidelineProps {
  onClose: () => void;
}

const FormFieldDetectionGuideline = (props: IFormFieldDetectionGuidelineProps) => {
  const { onClose } = props;
  const { t } = useTranslation();
  return (
    <div className={styles.guide}>
      <div className={styles.guideHeader}>
        <h4 className={styles.guideHeaderTitle}>{t('viewer.formFieldDetection.guideline.title')}</h4>
        <IconButton className={styles.guideHeaderIcon} icon="md_close" iconSize={24} onClick={onClose} />
      </div>
      <ul className={styles.guideList}>
        <li>{t('viewer.formFieldDetection.guideline.selecting')}</li>
        <li>
          <Trans i18nKey="viewer.formFieldDetection.guideline.applying" components={{ b: <b /> }} />
        </li>
      </ul>
    </div>
  );
};

export default FormFieldDetectionGuideline;
