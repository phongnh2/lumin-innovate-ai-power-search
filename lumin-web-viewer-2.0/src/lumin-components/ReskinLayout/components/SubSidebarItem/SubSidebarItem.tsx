import classNames from 'classnames';
import { PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { useNetworkStatus } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { TOOLTIP_MAX_WIDTH, TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';

import styles from './SubSidebarItem.module.scss';

type SubSidebarItemProps = {
  title: string;
  leftElement: JSX.Element;
  rightElement?: JSX.Element;
  to: string;
  disabledTooltip?: boolean;
  activeTab?: string;
  externalLink?: boolean;
  end?: boolean;
};
const SubSidebarItem = (props: SubSidebarItemProps): JSX.Element => {
  const {
    leftElement,
    rightElement,
    title,
    to,
    activeTab,
    externalLink = false,
    end = false,
    disabledTooltip = false,
    ...otherProps
  } = props;

  const { isOffline } = useNetworkStatus();
  const { onKeyDown } = useKeyboardAccessibility();

  return (
    <NavLink
      tabIndex={-1}
      to={to}
      end={end}
      target={externalLink ? '_blank' : undefined}
      className={classNames(styles.wrapper, { [styles.disabled]: isOffline })}
    >
      {({ isActive }) => (
        <PlainTooltip
          content={title}
          position="bottom"
          openDelay={TOOLTIP_OPEN_DELAY}
          maw={TOOLTIP_MAX_WIDTH}
          className={styles.tooltip}
          disabled={disabledTooltip || isOffline}
        >
          <div
            role="button"
            tabIndex={0}
            onKeyDown={onKeyDown}
            className={styles.container}
            data-document-activated={isActive && activeTab === 'documentTab'}
            data-setting-activated={isActive && activeTab === 'settingTab'}
            data-active={isActive}
            {...otherProps}
          >
            {leftElement && <div className={styles.leftElement}>{leftElement}</div>}
            <Text
              className={styles.title}
              color="var(--kiwi-colors-surface-on-surface)"
              size="md"
              type="label"
              ellipsis
            >
              {title}
            </Text>
            {rightElement && <div className={styles.rightElement}>{rightElement}</div>}
          </div>
        </PlainTooltip>
      )}
    </NavLink>
  );
};

export default SubSidebarItem;
