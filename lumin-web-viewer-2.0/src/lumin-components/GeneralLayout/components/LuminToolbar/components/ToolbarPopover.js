import classNames from 'classnames';
import isBoolean from 'lodash/isBoolean';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import KeyEventProvider from '@new-ui/components/SearchOverlay/KeyEventProvider';
import Popper from '@new-ui/general-components/Popper';
import { ClickAwayTouchEvent } from '@new-ui/general-components/Popper/Popper.enum';

import selectors from 'selectors';

import { useDebounceNavigationPopover } from 'hooks/useDebounceNavigationPopover';

import { quickSearchSelectors } from 'features/QuickSearch/slices';

import { toolbarActions } from '../slices';

import styles from './ToolbarPopover.module.scss';

export const QUICK_SEARCH_POPOVER_OFFSET = 16;

const ToolbarPopover = ({
  renderPopperContent,
  renderChildren,
  popperVisible,
  onClickAway: onClickAwayFromProps,
  containerMaxWidth,
  contentClassName,
  paperProps,
}) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [visible, setVisible] = useState(false);
  const isAnnotationLoaded = useSelector(selectors.getAnnotationsLoaded);
  const isOpenQuickSearch = useSelector(quickSearchSelectors.isOpenQuickSearch);

  const { isToolbarPopoverVisible, popperPosition } = useDebounceNavigationPopover({
    defaultPopperPosition: 'bottom-end',
    closePopperCallback: () => setVisible(false),
  });

  const handleClose = (e) => {
    setVisible(false);
    onClickAwayFromProps(e);

    if (isToolbarPopoverVisible) {
      dispatch(toolbarActions.resetToolbarPopover());
    }
  };

  const visibleValue = useMemo(() => {
    if (isBoolean(popperVisible)) {
      return popperVisible;
    }
    return visible;
  }, [popperVisible, visible]);

  const handleShowPopper = useCallback(() => {
    if (isAnnotationLoaded) {
      setVisible(true);
    }
  }, [isAnnotationLoaded]);

  const handleClosePopper = useCallback(() => setVisible(false), []);

  const callbackRef = useCallback((element) => {
    setAnchorEl(element);
  }, []);

  const getPopperOffset = ({ enabled, offset }) => ({ enabled, options: { offset } });

  return (
    <>
      {renderChildren({ handleShowPopper, ref: callbackRef, visible })}
      <KeyEventProvider close={handleClose}>
        <Popper
          modifiers={[
            {
              name: 'preventOverflow',
              enabled: !isOpenQuickSearch,
              options: {
                altAxis: true,
                altBoundary: true,
                tether: true,
                rootBoundary: 'viewport',
                padding: 8,
              },
            },
            {
              name: 'eventListeners',
              enabled: isOpenQuickSearch,
              options: {
                scroll: false,
              },
            },
            {
              name: 'offset',
              ...getPopperOffset({ enabled: isOpenQuickSearch, offset: [0, QUICK_SEARCH_POPOVER_OFFSET] }),
            },
          ]}
          popperOptions={{
            strategy: 'fixed',
          }}
          paperProps={
            ({
              rounded: 'large',
              elevation: 2,
            },
            { ...paperProps })
          }
          open={visibleValue}
          anchorEl={anchorEl}
          onClose={handleClose}
          elevation={5}
          placement={popperPosition}
          disablePortal
          touchEvent={ClickAwayTouchEvent.ON_TOUCH_START}
        >
          <div
            className={classNames(styles.content, contentClassName)}
            style={{ width: containerMaxWidth, maxWidth: containerMaxWidth || 300 }}
          >
            {renderPopperContent({
              onClick: handleShowPopper,
              closePopper: handleClosePopper,
              isActive: visible,
              anchorEl,
            })}
          </div>
        </Popper>
      </KeyEventProvider>
    </>
  );
};

ToolbarPopover.propTypes = {
  renderChildren: PropTypes.func.isRequired,
  renderPopperContent: PropTypes.func.isRequired,
  popperVisible: PropTypes.bool,
  onClickAway: PropTypes.func,
  containerMaxWidth: PropTypes.number,
  contentClassName: PropTypes.string,
  paperProps: PropTypes.object,
};

ToolbarPopover.defaultProps = {
  popperVisible: null,
  onClickAway: (f) => f,
  containerMaxWidth: undefined,
  contentClassName: undefined,
  paperProps: {},
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPopover);
