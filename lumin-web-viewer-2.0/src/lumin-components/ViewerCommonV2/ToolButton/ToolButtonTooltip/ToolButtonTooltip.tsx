import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { ComponentProps } from 'react';

import styles from './ToolButtonTooltip.module.scss';

const ToolButtonTooltip = ({
  content,
  shortcut,
  children,
  position = 'bottom',
  ...otherProps
}: ComponentProps<typeof PlainTooltip> & { shortcut: string }) => {
  const getContent = () => {
    if (!shortcut) {
      return content;
    }

    return (
      <>
        <span>{content}</span>
        <span className={styles.shortcut}>{shortcut}</span>
      </>
    );
  };

  return (
    <PlainTooltip content={getContent()} position={position} {...otherProps}>
      {children}
    </PlainTooltip>
  );
};

export default ToolButtonTooltip;
