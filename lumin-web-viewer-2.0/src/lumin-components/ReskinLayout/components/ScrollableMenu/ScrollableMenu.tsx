import { Menu, MenuProps } from 'lumin-ui/kiwi-ui';
import React, { useCallback } from 'react';

import { MiddlewareState } from './ScrollableMenu.types';
import { computeOverflowMaxHeight } from './ScrollableMenu.utils';

import styles from './ScrollableMenu.module.scss';

interface ScrollableMenuProps extends Omit<MenuProps, 'middlewares'> {
  children: React.ReactNode;
  middlewares?: Omit<MenuProps['middlewares'], 'flip'>;
}

const ScrollableMenu = ({ middlewares: middlewaresProps = {}, ...otherProps }: ScrollableMenuProps) => {
  const flipMiddlewaresHandler = useCallback((state: MiddlewareState) => {
    const maxHeight = computeOverflowMaxHeight(state);
    Object.assign(state.elements.floating.style, {
      overflowY: 'auto',
      maxHeight,
    });
    return { fallbackStrategy: 'bestFit' };
  }, []);

  return (
    <Menu
      floatingStrategy="fixed"
      middlewares={{
        ...middlewaresProps,
        flip: flipMiddlewaresHandler as unknown,
      }}
      classNames={{
        dropdown: styles.dropdown,
      }}
      {...otherProps}
    >
      {otherProps.children}
    </Menu>
  );
};

export default ScrollableMenu;
