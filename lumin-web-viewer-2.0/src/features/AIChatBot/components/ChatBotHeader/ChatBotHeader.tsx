import { IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { ChatBotMenu } from '../ChatBotMenu';
import { MenuItemProps } from '../ChatBotMenu/components/MenuPopover';

import styles from './ChatBotHeader.module.scss';

type ChatBotHeaderProps = {
  onClose: () => void;
  leftSection: React.ReactNode;
  menuItems?: MenuItemProps[];
};

const ChatBotHeader = ({ onClose, leftSection, menuItems }: ChatBotHeaderProps) => (
  <div className={styles.header}>
    <div className={styles.titleWrapper}>{leftSection}</div>
    <div className={styles.rightWrapper}>
      {!!menuItems?.length && <ChatBotMenu menuItems={menuItems} />}

      <IconButton icon="x-md" size="md" onClick={onClose} />
    </div>
  </div>
);
export default ChatBotHeader;
