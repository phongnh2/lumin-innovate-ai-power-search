import { Icomoon, IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './TogglePanelButton.module.scss';

type TogglePanelButtonProps = {
  collapsed: boolean;
  display: boolean;
  toggle: () => void;
  setDisplay: (display: boolean) => void;
};

const TogglePanelButton = ({ collapsed, display, toggle, setDisplay }: TogglePanelButtonProps) => (
  <>
    <div className={styles.container} onMouseEnter={() => setDisplay(true)} onMouseLeave={() => setDisplay(false)} />
    <div className={styles.wrapper} data-collapsed={collapsed} data-display={display}>
      <IconButton
        size="sm"
        classNames={{
          root: styles.root,
        }}
        icon={
          <Icomoon
            size="sm"
            type={collapsed ? 'ph-caret-double-right' : 'ph-caret-double-left'}
            color="var(--kiwi-colors-surface-on-surface)"
          />
        }
        onClick={toggle}
      />
    </div>
  </>
);

export default TogglePanelButton;
