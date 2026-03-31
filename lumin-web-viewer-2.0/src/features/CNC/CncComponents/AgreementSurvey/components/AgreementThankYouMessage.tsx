import { Text } from 'lumin-ui/kiwi-ui';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import IconThanks from 'assets/lumin-svgs/icon-graphic-thanks.svg';

import styles from './AgreementThankYouMessage.module.scss';

const AgreementThankYouMessage = () => (
  <AnimatePresence mode="popLayout">
    <motion.div
      key="agreement-thank-you-message"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={styles.container}
    >
      <img src={IconThanks} alt="Thanks" />
      <div className={styles.content}>
        <Text type="headline" size="sm" color="var(--kiwi-colors-surface-on-surface)">
          Thank you!
        </Text>
        <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
          Your feedback has been received. We appreciate your input!
        </Text>
      </div>
    </motion.div>
  </AnimatePresence>
);

export default AgreementThankYouMessage;
