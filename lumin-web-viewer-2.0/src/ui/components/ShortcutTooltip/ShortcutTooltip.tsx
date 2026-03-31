import { PlainTooltip, TooltipProps } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './ShortcutTooltip.module.scss';

export type ShortcutTooltipProps = TooltipProps & {
  shortcut: React.ReactNode;
};

const ShortcutTooltip = ({ shortcut, children, content, ...otherProps }: ShortcutTooltipProps) => (
  <PlainTooltip
    content={
      <>
        {content}
        {shortcut && <span className={styles.shortcut}>{shortcut}</span>}
      </>
    }
    {...otherProps}
  >
    {children}
  </PlainTooltip>
);

export default ShortcutTooltip;
