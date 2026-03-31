/**
 * @link https://v4.mui.com/api/popper/
 */
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import classNames from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import rafSchd from 'raf-schd';
import React, { useState, useMemo, useEffect } from 'react';

import ClickAwayListener from 'lumin-components/Shared/ClickAwayListener';
import CustomScroll from 'lumin-components/Shared/CustomScroll';

import { useIsMountedRef, useLayoutScroll } from 'hooks';
import './MaterialPopper.scss';

const propTypes = {
  classes: PropTypes.string,
  parentOverflow: PropTypes.oneOf(['scrollParent', 'viewport', 'disabled', 'window']),
  flip: PropTypes.bool,
  preventOverflow: PropTypes.bool,
  children: PropTypes.element,
  handleClose: PropTypes.func,
  open: PropTypes.bool,
  anchorEl: PropTypes.any,
  placement: PropTypes.oneOf([
    'bottom-end',
    'bottom-start',
    'bottom',
    'left-end',
    'left-start',
    'left',
    'right-end',
    'right-start',
    'right',
    'top-end',
    'top-start',
    'top',
  ]),
  disablePortal: PropTypes.bool,
  scrollWillClosePopper: PropTypes.bool,
  onClose: PropTypes.func,
  style: PropTypes.object,
  disableClickAway: PropTypes.bool,
  onExited: PropTypes.func,
  backgroundColor: PropTypes.string,
  autoHeightMax: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  scrollbarClassName: PropTypes.string,
  showArrow: PropTypes.bool,
  arrowClasses: PropTypes.string,
  styleContentClasses: PropTypes.string,
  hasDropDownList: PropTypes.bool,
  noPadding: PropTypes.bool,
  modifiers: PropTypes.array,
};

const defaultProps = {
  classes: '',
  parentOverflow: 'scrollParent',
  flip: true,
  preventOverflow: true,
  children: null,
  handleClose: () => {},
  open: false,
  anchorEl: null,
  placement: 'bottom',
  disablePortal: true,
  scrollWillClosePopper: false,
  onClose: () => {},
  style: {},
  disableClickAway: false,
  onExited: () => {},
  backgroundColor: '',
  autoHeightMax: 'none',
  scrollbarClassName: '',
  showArrow: false,
  arrowClasses: '',
  styleContentClasses: '',
  hasDropDownList: false,
  noPadding: false,
  modifiers: [],
};

const MaterialPopper = ({
  classes,
  parentOverflow,
  flip,
  preventOverflow,
  children,
  handleClose,
  open,
  anchorEl,
  placement,
  disablePortal,
  scrollWillClosePopper,
  onClose,
  style,
  disableClickAway,
  onExited,
  backgroundColor,
  autoHeightMax,
  scrollbarClassName,
  showArrow,
  arrowClasses,
  styleContentClasses,
  hasDropDownList,
  noPadding,
  modifiers: modifiersProps,
  ...otherProps
}) => {
  const isMounted = useIsMountedRef();
  const [arrowRef, setArrowRef] = useState(null);

  const handleClickAway = (...args) => {
    if (disableClickAway) {
      return;
    }
    handleClose(...args);
  };

  const defaultModifiers = useMemo(
    () => [
      {
        name: 'flip',
        enabled: flip,
      },
      {
        name: 'preventOverflow',
        enabled: Boolean(preventOverflow),
        options: {
          padding: 8,
          rootBoundary: parentOverflow,
        },
      },
      {
        name: 'arrow',
        enabled: showArrow,
        options: {
          element: arrowRef,
        },
      },
    ],
    [parentOverflow, preventOverflow, showArrow, arrowRef, flip]
  );

  const modifiers = useMemo(() => {
    if (!modifiersProps.length) {
      return defaultModifiers;
    }
    const foundIndex = modifiersProps.findIndex((item) => item.name === 'arrow');

    if (foundIndex !== -1) {
      const clonedModifiers = cloneDeep(modifiersProps);
      clonedModifiers[foundIndex].options.element = arrowRef;
      return clonedModifiers;
    }

    return modifiersProps;
  }, [defaultModifiers, modifiersProps, arrowRef]);

  const scrollHandler = useMemo(
    () =>
      rafSchd(() => {
        if (scrollWillClosePopper && isMounted.current) {
          onClose();
        }
      }),
    []
  );

  const handleExited = (exitedCallback = () => {}) => {
    exitedCallback();
    onExited();
  };

  const popperContentScroll = useMemo(() => (
    <div className={classNames('Popper__contentScroll', scrollbarClassName, {
          'Popper__contentScroll--no-padding': noPadding,
    })}>
        {children}
      </div>
  ), [children, scrollbarClassName]);

  const popperContent = useMemo(
    () => (autoHeightMax !== 'none' ? (
      <CustomScroll
        autoHide
        autoHeight
        autoHeightMax={autoHeightMax}
        hideTracksWhenNotNeeded
      >
          {popperContentScroll}
        </CustomScroll>
      ) : (
      <div>
        {popperContentScroll}
      </div>
    )),
    [autoHeightMax, popperContentScroll],
  );

  useLayoutScroll(scrollHandler);

  useEffect(() => () => scrollHandler.cancel());

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      transition
      disablePortal={disablePortal}
      placement={placement || 'bottom'}
      modifiers={modifiers}
      className={classNames('Popper', classes, showArrow && 'Popper--has-arrow')}
      onClick={(e) => e.stopPropagation()}
      style={style}
      {...otherProps}
    >
      {({ TransitionProps: { onExited: onExitedCb, ...rest }, placement: _placement }) => (
        <ClickAwayListener onClickAway={handleClickAway} disableReactTree>
          <div>
            {showArrow && (
              <Grow
                timeout={200}
                {...rest}
                onExited={() => handleExited(onExitedCb)}
                style={{
                  transformOrigin: _placement.includes('bottom') ? 'top center' : 'bottom center',
                  backgroundColor,
                }}
              >
                <span className={`arrow ${arrowClasses || ''}`} ref={(node) => setArrowRef(node)} />
              </Grow>
            )}
            <Grow
              timeout={200}
              className={classNames('Popper__styleContent', {
                'Popper__styleContent--has-arrow': showArrow,
                'Popper__styleContent--has-dropdown-list': hasDropDownList,
                [styleContentClasses]: Boolean(styleContentClasses),
              })}
              {...rest}
              onExited={() => handleExited(onExitedCb)}
              style={{
                transformOrigin: _placement.includes('bottom') ? 'top center' : 'bottom center',
                backgroundColor,
              }}
            >
              <div>{popperContent}</div>
            </Grow>
          </div>
        </ClickAwayListener>
      )}
    </Popper>
  );
};
MaterialPopper.propTypes = propTypes;
MaterialPopper.defaultProps = defaultProps;

export default MaterialPopper;
