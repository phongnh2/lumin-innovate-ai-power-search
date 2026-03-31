import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './MenuItemShortcut.module.scss';

interface MenuItemShortcutProps {
  shortcut: string;
}

const MenuItemShortcut = ({ shortcut }: MenuItemShortcutProps) => (
  <div className={styles.wrapper}>
    <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-low)">
      {shortcut}
    </Text>
  </div>
);

export default MenuItemShortcut;
