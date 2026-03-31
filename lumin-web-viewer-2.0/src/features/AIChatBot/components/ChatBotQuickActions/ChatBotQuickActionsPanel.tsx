import React from 'react';

import ChatBotQuickActionsCategory from './ChatBotQuickActionsCategory';
import { useChatBotQuickActions } from './ChatBotQuickActionsContext';
import ChatBotQuickActionsSection from './ChatBotQuickActionsSection';

import styles from './ChatBotQuickActions.module.scss';

const ChatBotQuickActionsPanel = () => {
  const { actions, categories } = useChatBotQuickActions();
  return (
    <div className={styles.panel}>
      {!!categories?.length && (
        <div className={styles.categoryContainer}>
          <ChatBotQuickActionsCategory />
        </div>
      )}

      <div className={styles.sectionContainer}>
        {Object.entries(actions).map(([key, action]) => (
          <ChatBotQuickActionsSection
            key={key}
            title={action.title}
            items={action.items}
            rightSection={action.rightSection}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatBotQuickActionsPanel;
