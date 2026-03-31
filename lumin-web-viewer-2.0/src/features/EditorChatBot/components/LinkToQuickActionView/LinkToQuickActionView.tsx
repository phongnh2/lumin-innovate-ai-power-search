import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';

import styles from './LinkToQuickActionView.module.scss';

const LinkToQuickActionView = () => {
  const { t } = useTranslation();
  const { isQuickActionOpen, setIsQuickActionOpen } = useChatbotStore();
  const onClick = () => {
    if (!isQuickActionOpen) {
      setIsQuickActionOpen(true);
    }
  };

  return (
    <button onClick={onClick} className={styles.link}>
      {t('viewer.chatbot.menu.linkToQuickAction')}
    </button>
  );
};

export default LinkToQuickActionView;
