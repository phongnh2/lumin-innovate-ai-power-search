import { Icomoon, MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './MenuPopover.module.scss';

export interface MenuItemProps {
  label: string;
  icon: string;
  color?: string;
  onClick: () => void;
  disabled?: boolean;
  key: string;
  'data-lumin-btn-name'?: string;
  'data-lumin-btn-purpose'?: string;
}

export const MenuPopover = ({ menuItems }: { menuItems: MenuItemProps[] }) => (
  <>
    {menuItems.map((item) => (
      <MenuItem
        key={item.key}
        onClick={item.disabled ? undefined : item.onClick}
        role="button"
        tabIndex={0}
        data-disabled={item.disabled}
        data-lumin-btn-name={item['data-lumin-btn-name']}
        data-lumin-btn-purpose={item['data-lumin-btn-purpose']}
      >
        <div className={styles.menuItem}>
          <Icomoon type={item.icon} size="md" style={{ color: `var(${item.color})` }} />
          <p className={styles.menuItemLabel} style={{ color: `var(${item.color})` }}>
            {item.label}
          </p>
        </div>
      </MenuItem>
    ))}
  </>
);
