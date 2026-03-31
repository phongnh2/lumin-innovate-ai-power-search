import { Chip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './ChatBotWelcome.module.scss';

interface ChatBotWelcomeProps {
  title: string;
  description: string;
  commands: { label: React.ReactNode; onClick: () => void }[];
}

const ChatBotWelcome: React.FC<ChatBotWelcomeProps> = ({ title, description, commands }) => (
  <div className={styles.welcome}>
    <h2 className={styles.welcomeTitle}>{title}</h2>
    <p className={styles.welcomeDescription}>{description}</p>
    <div className={styles.welcomeCommands}>
      {commands.map(({ label, onClick }, idx) => (
        <Chip
          key={idx}
          label={label}
          variant="light"
          colorType="blue"
          size="sm"
          enablePointerEvents
          rounded
          onClick={onClick}
        />
      ))}
    </div>
  </div>
);

export default ChatBotWelcome;
