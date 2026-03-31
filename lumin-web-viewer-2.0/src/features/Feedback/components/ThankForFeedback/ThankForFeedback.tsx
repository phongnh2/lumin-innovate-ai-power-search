import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import ThankForFeedbackImg from 'assets/images/thank-for-feedback.png';

import { useTranslation } from 'hooks/useTranslation';

import styles from './ThankForFeedback.module.scss';

const ThankForFeedback = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <img src={ThankForFeedbackImg} alt="fly" />
      <Text type="body" size="lg" color="var(--kiwi-colors-surface-on-surface)">
        {t('shareDocumentFeedbackModal.thankYou')}
      </Text>
    </div>
  );
};

export default ThankForFeedback;
