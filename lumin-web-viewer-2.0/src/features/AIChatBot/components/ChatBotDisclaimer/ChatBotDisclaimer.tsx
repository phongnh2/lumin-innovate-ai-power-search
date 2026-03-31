import React from 'react';

import styles from './ChatBotDisclaimer.module.scss';

interface ChatBotDisclaimerProps {
  message?: string;
}

export const ChatBotDisclaimer: React.FC<ChatBotDisclaimerProps> = ({ message }) => (
  <div className={styles.disclaimer}>
    <p>{message}</p>
  </div>
);

export default ChatBotDisclaimer;
