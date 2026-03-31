import classNames from 'classnames';
import React from 'react';

import styles from './ChatBotQuickActions.module.scss';

type ChatBotQuickActionsItemProps = {
  name: string;
  icon: React.ReactElement;
  description: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
};

const ChatBotQuickActionsItem = (props: ChatBotQuickActionsItemProps) => {
  const { name, icon, description, onClick, className } = props;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick(e as never);
    }
  };

  return (
    <div
      data-cy="chat_bot_quick_action_item"
      role="button"
      tabIndex={0}
      className={classNames(styles.item, className)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {icon && <div className={styles.itemIcon}>{icon}</div>}
      <div>
        <h4 className={styles.itemName}>{name}</h4>
        <p className={styles.itemDescription}>{description}</p>
      </div>
    </div>
  );
};

export default ChatBotQuickActionsItem;
