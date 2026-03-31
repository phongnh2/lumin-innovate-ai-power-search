import { Fade } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MuiPopper, { PopperProps as BasePopperProps } from '@mui/material/Popper';
import classNames from 'classnames';
import React, { useState } from 'react';

import Paper from '@new-ui/general-components/Paper';

import PopperArrowImg from 'assets/lumin-svgs/popper-arrow.svg?component';

import { ZIndex } from 'constants/styles';

import { ARROW_HEIGHT } from './constants';
import { ClickAwayMouseEvent, TClickAwayMouseEvent, TClickAwayTouchEvent, ClickAwayTouchEvent } from './Popper.enum';

import styles from './Popper.module.scss';

export interface PopperProps extends BasePopperProps {
  children: React.ReactNode;
  open: boolean;
  onClose?: (event: MouseEvent | TouchEvent) => void;
  paperProps?: React.ComponentProps<typeof Paper>;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  mouseEvent?: TClickAwayMouseEvent | false;
  touchEvent?: TClickAwayTouchEvent | false;
  zIndex?: number | string;
  modifiers?: BasePopperProps['modifiers'];
  hasArrow?: boolean;
  anchorEl?: HTMLElement;
}

const Popper = React.forwardRef<HTMLDivElement, PopperProps>(
  (
    {
      children,
      onClose = () => {},
      paperProps,
      elevation = 1,
      style,
      modifiers = [],
      open,
      mouseEvent = ClickAwayMouseEvent.ON_CLICK,
      touchEvent = ClickAwayTouchEvent.ON_TOUCH_END,
      zIndex = ZIndex.POPOVER,
      popperOptions,
      hasArrow,
      ...props
    },
    ref
  ) => {
    const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

    return (
      open && (
        <MuiPopper
          ref={ref}
          style={{ zIndex, ...style }}
          className={classNames(styles.popper)}
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, hasArrow ? 8 + ARROW_HEIGHT : 8],
              },
            },
            {
              name: 'preventOverflow',
              options: {
                altAxis: true,
                padding: 8,
              },
            },
            {
              name: 'arrow',
              enabled: Boolean(arrowRef),
              options: {
                element: arrowRef,
              },
            },
            ...modifiers,
          ]}
          open={open}
          transition
          popperOptions={popperOptions}
          {...props}
        >
          {({ TransitionProps }) => (
            <ClickAwayListener onClickAway={onClose} mouseEvent={mouseEvent} touchEvent={touchEvent}>
              <Fade {...TransitionProps} timeout={300}>
                <Paper elevation={elevation} {...paperProps}>
                  {children}
                  {hasArrow && (
                    <div ref={setArrowRef} className={styles.arrowWrapper}>
                      <PopperArrowImg className={styles.arrowImage} />
                    </div>
                  )}
                </Paper>
              </Fade>
            </ClickAwayListener>
          )}
        </MuiPopper>
      )
    );
  }
);

export default Popper;
