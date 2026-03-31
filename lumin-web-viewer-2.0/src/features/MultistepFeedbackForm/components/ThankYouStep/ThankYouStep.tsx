import React from 'react';
import { Trans } from 'react-i18next';

import ThankForFeedbackImg from 'assets/images/thank-for-feedback.png';

import styles from './ThankYouStep.module.scss';

const ThankYouStep = () => (
  <>
    <div className={styles.iconContainer}>
      <img className={styles.icon} src={ThankForFeedbackImg} alt="fly, cloud" />
    </div>
    <p className={styles.text}>
      <Trans
        i18nKey="viewer.multiFeedbackForm.step3.description"
        components={{
          br: <br />,
        }}
      />
    </p>
  </>
);

export default ThankYouStep;
