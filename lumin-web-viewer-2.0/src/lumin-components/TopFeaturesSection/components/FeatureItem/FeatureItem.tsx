import classNames from 'classnames';
import { Icomoon } from 'lumin-ui/kiwi-ui';
import React, { forwardRef } from 'react';

import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import styles from './FeatureItem.module.scss';

type FeatureItemProps = {
  icon: string;
  content: string;
  activated?: boolean;
  onTrigger?(): void;
  className?: string;
  withFocusable?: boolean;
};

const FeatureItem = forwardRef<HTMLDivElement, FeatureItemProps>(
  ({ icon, content, activated = false, onTrigger = () => {}, className, withFocusable = true, ...otherProps }, ref) => {
    const { onKeyDown } = useKeyboardAccessibility();

    const extraProps = withFocusable && {
      role: 'button',
      tabIndex: 0,
    };

    return (
      <div
        ref={ref}
        role="presentation"
        className={classNames(styles.container, className)}
        data-activated={activated}
        onClick={onTrigger}
        onKeyDown={onKeyDown}
        {...otherProps}
        {...extraProps}
      >
        <Icomoon size="lg" type={icon} color="var(--kiwi-colors-surface-on-surface)" />
        <p className={styles.text}>{content}</p>
      </div>
    );
  }
);

export default FeatureItem;
