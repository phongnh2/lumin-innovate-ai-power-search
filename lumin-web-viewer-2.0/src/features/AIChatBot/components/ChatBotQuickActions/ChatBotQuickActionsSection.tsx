import React from 'react';

import { useChatBotQuickActions } from './ChatBotQuickActionsContext';
import ChatBotQuickActionsItem from './ChatBotQuickActionsItem';
import { QuickActionItem } from './interface';

import styles from './ChatBotQuickActions.module.scss';

type ChatBotQuickActionsSectionProps = {
  items: QuickActionItem[];
  title: string;
  className?: string;
  rightSection?: React.ReactNode;
};

const ChatBotQuickActionsSection = (props: ChatBotQuickActionsSectionProps) => {
  const { items, title, className, rightSection } = props;
  const { onItemClick } = useChatBotQuickActions();
  return (
    <div className={className} data-cy="chat_bot_quick_actions_section">
      <div className={styles.sectionTitleContainer}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {rightSection}
      </div>
      {items.map((item) => (
        <ChatBotQuickActionsItem
          className={styles.sectionItem}
          key={item.id}
          name={item.name}
          icon={item.icon}
          description={item.description}
          onClick={(event) => onItemClick?.(event, item)}
        />
      ))}
    </div>
  );
};

export default ChatBotQuickActionsSection;
