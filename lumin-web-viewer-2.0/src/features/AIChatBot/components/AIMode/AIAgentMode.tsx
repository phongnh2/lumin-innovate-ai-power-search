import { CaretDownIcon } from '@luminpdf/icons/dist/csr/CaretDown';
import { CaretUpIcon } from '@luminpdf/icons/dist/csr/CaretUp';
import { Menu, MenuItem, Button } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import { AIModeType } from 'features/AIChatBot/interface';

import styles from './AIAgentMode.module.scss';

const AIAgentMode = ({ modes, AIMode }: { modes: AIModeType[]; AIMode: string }) => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const currentMode = modes.find((item) => item.id === AIMode) || modes?.[0];

  return (
    <Menu
      width="338px"
      offset={{ alignmentAxis: -46, mainAxis: 8 }}
      ComponentTarget={
        <Button
          data-cy="ai_agent_mode_button"
          startIcon={currentMode.startIcon}
          endIcon={isOpenMenu ? <CaretUpIcon size={16} /> : <CaretDownIcon size={16} />}
          variant="text"
          size="sm"
        >
          {currentMode.label}
        </Button>
      }
      position="top-start"
      onChange={(opened) => {
        setIsOpenMenu(opened);
      }}
      opened={isOpenMenu}
    >
      {modes.map((item) => (
        <MenuItem key={item.id} onClick={item.onClickMenuItem} activated={item.id === AIMode}>
          <div className={styles.menuItem}>
            {item.startIcon}
            <div className={styles.menuItemContent}>
              <p className={styles.menuItemLabel}>{item.label}</p>
              <p className={styles.menuItemDescription}>{item.description}</p>
            </div>
          </div>
        </MenuItem>
      ))}
    </Menu>
  );
};

export default AIAgentMode;
