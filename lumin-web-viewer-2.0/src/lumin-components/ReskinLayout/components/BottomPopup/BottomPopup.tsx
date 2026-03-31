import classNames from 'classnames';
import { Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useRef } from 'react';

import styles from './BottomPopup.module.scss';

interface BottomPopupProps {
  text?: string;
  isOpen?: boolean;
  iconType: string;
}

function BottomPopup({ isOpen = false, text = '', iconType }: BottomPopupProps) {
  const isClosing = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isClosing.current = true;
    }
  }, [isOpen]);
  return (
    <div className={styles.wrapper}>
      <div
        className={classNames(styles.container, {
          [styles.open]: isOpen,
          [styles.closing]: !isOpen && isClosing.current,
        })}
      >
        <Icomoon type={iconType} size="lg" />
        <Text size="md" type="label" ellipsis>
          {text}
        </Text>
      </div>
    </div>
  );
}

export default BottomPopup;
