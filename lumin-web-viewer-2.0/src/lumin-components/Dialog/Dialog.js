/**
 * Document:
 * https://v4.mui.com/api/dialog/#dialog-api
 */

import MaterialDialog from '@mui/material/Dialog';
import classNames from 'classnames';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTheme } from 'styled-components';

import { updateDialogStatus } from 'actions/customActions';

import { useThemeMode } from 'hooks/useThemeMode';

import { ModalPlacement, ModalPriority, ModalSize } from 'constants/styles/Modal';

import * as Styled from './Dialog.styled';

/**
 * @deprecated use Dialog in lumin-ui/kiwi-ui instead
 */
const Dialog = React.forwardRef((props, ref) => {
  const {
    children,
    open,
    classes,
    width,
    noPadding,
    hasCloseBtn,
    onClose,
    hasOverlapped,
    disableBackdropClick,
    placement,
    priority,
    closeBtn,
    ...inheritProps
  } = props;
  const dispatch = useDispatch();
  const { themeMode } = useTheme() || {};
  const themeModeDefault = useThemeMode();
  const customClasses = Styled.useStyles({
    width,
    theme: themeMode || themeModeDefault,
    noPadding,
    hasOverlapped,
    hasCloseBtn,
    fullScreen: inheritProps.fullScreen,
    placement,
    priority,
  });

  const mergedClasses = {
    ...classes,
    root: classNames(customClasses.root, classes.container),
    container: classNames(customClasses.container, classes.container),
    paper: classNames(customClasses.paper, classes.paper),
    closeButton: classNames(customClasses.closeButton, classes.closeButton),
  };

  useEffect(
    () => () => {
      dispatch(updateDialogStatus(false));
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(updateDialogStatus(open));
  }, [open, dispatch]);

  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    onClose(event, reason);
  };

  return (
    <MaterialDialog
      {...inheritProps}
      ref={ref}
      open={open}
      classes={omit(mergedClasses, 'closeButton')}
      maxWidth={false}
      onClose={handleClose}
      disableEnforceFocus
    >
      {hasCloseBtn && (
        <Styled.IconButton
          aria-label="Close"
          icon="cancel"
          onClick={() => onClose({ isCloseBtn: true })}
          iconColor={closeBtn.color}
          iconSize={closeBtn.size || 14}
          size={28}
          className={mergedClasses.closeButton}
          style={closeBtn.style}
        />
      )}
      {children}
    </MaterialDialog>
  );
});

Dialog.propTypes = {
  children: PropTypes.any,
  open: PropTypes.bool,
  classes: PropTypes.object,
  closeBtn: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(Object.values(ModalSize))]),
  noPadding: PropTypes.bool,
  hasCloseBtn: PropTypes.bool,
  onClose: PropTypes.func,
  disableBackdropClick: PropTypes.bool,
  hasOverlapped: PropTypes.bool,
  fullScreen: PropTypes.bool,
  placement: PropTypes.oneOf(Object.values(ModalPlacement)),
  priority: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(Object.values(ModalPriority))]),
};

Dialog.defaultProps = {
  children: null,
  open: false,
  classes: {},
  closeBtn: {},
  width: ModalSize.MD,
  noPadding: false,
  hasCloseBtn: false,
  onClose: () => {},
  disableBackdropClick: false,
  hasOverlapped: false,
  fullScreen: false,
  placement: ModalPlacement.CENTER,
  priority: ModalPriority.MEDIUM,
};

export default Dialog;
