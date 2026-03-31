import { IconButton, Text } from 'lumin-ui/kiwi-ui';
import { motion } from 'motion/react';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import styles from './ChatBotFeedback.module.scss';

interface ThankYouMessageProps {
  onClose: () => void;
}

const ThankYouMessage = ({ onClose }: ThankYouMessageProps) => {
  const { t } = useTranslation();
  return (
    <motion.div
      key="thank-you-message"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25 }}
      className={styles.thanks}
    >
      <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)">
        {t('viewer.chatbot.feedback.thank')}
      </Text>
      <IconButton icon="ph-x" size="sm" onClick={onClose} />
    </motion.div>
  );
};

export default ThankYouMessage;
