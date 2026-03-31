import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './CompressWarning.module.scss';

interface WarningMessageProps {
  message: string;
  actionText?: string;
  additionalText?: string;
  actionClick?: () => void;
}

const WarningMessage = ({ message, actionText, actionClick, additionalText }: WarningMessageProps) => (
  <div className={styles.content}>
    <Text type="body" size="md">
      {message}
    </Text>
    {actionText && (
      <Text type="body" size="md" className={styles.link} onClick={actionClick}>
        {actionText}
      </Text>
    )}
    {additionalText && (
      <Text type="body" size="md">
        {additionalText}
      </Text>
    )}
  </div>
);

export default WarningMessage;
