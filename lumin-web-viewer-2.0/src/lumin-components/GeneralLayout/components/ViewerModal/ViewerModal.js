/* eslint-disable unused-imports/no-unused-vars */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import Modal from 'lumin-components/GeneralLayout/general-components/Modal';

import { DataElements } from 'constants/dataElement';
import { ModalTypes } from 'constants/lumin-common';
import { ModalPriority } from 'constants/styles/Modal';
import { TOOLS_NAME } from 'constants/toolsName';

const ViewerModal = ({ modalData, closeModal, activeToolName }) => {
  const {
    open,
    title,
    message,
    confirmButtonTitle,
    onConfirm = () => {},
    size,
    showCloseIcon,
    checkboxMessage,
    onCancel,
    cancelButtonTitle = 'Cancel',
    footerVariant,
    footer,
    center,
    icon,
    isProcessing,
    disableBackdropClick,
    disableEscapeKeyDown,
    closeOnConfirm = true,
    cancelDataLumin,
    confirmDataLumin,
    onClose: onCloseProp = () => {},
    TransitionProps,
    priority = ModalPriority.MEDIUM,
    PaperProps = {},
    confirmButtonProps,
    type,
    useReskinModal,
  } = modalData;
  const [isChecked, setIsChecked] = useState(false);

  const dispatch = useDispatch();

  const onClose = (event, reason) => {
    setIsChecked(false);
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    if (activeToolName === TOOLS_NAME.REDACTION) {
      dispatch(actions.openElement(DataElements.ANNOTATION_POPUP));
    }
    onCloseProp?.(event, reason);
    closeModal(event, reason);
  };

  const onPrimaryClick = async () => {
    await onConfirm?.(isChecked);
    if (closeOnConfirm) {
      onClose();
    }
  };

  const onSecondaryClick = (event) => {
    onCancel?.(isChecked, event);
    if (closeOnConfirm) {
      onClose(event);
    }
  };

  if (type === ModalTypes.HIT_DOC_STACK || useReskinModal) {
    return null;
  }

  return open ? (
    <Modal
      title={title}
      open={open}
      onClose={onClose}
      primaryText={confirmButtonTitle}
      onSecondaryClick={onSecondaryClick}
      secondaryText={cancelButtonTitle}
      size={size}
      showCloseIcon={showCloseIcon}
      onPrimaryClick={onPrimaryClick}
      checkboxMessage={checkboxMessage}
      setIsChecked={setIsChecked}
      footerVariant={footerVariant}
      footer={footer}
      center={center}
      icon={icon}
      primaryButtonProps={{
        ...confirmDataLumin,
        ...confirmButtonProps,
        isLoading: isProcessing,
      }}
      secondaryButtonProps={{
        ...cancelDataLumin,
        disabled: isProcessing,
      }}
      disableEscapeKeyDown={disableEscapeKeyDown}
      TransitionProps={TransitionProps}
      priority={priority}
      PaperProps={PaperProps}
    >
      {message}
    </Modal>
  ) : null;
};

const mapStateToProps = (state) => ({
  modalData: selectors.getModalData(state),
  activeToolName: selectors.getActiveToolName(state),
});

const mapDispatchToProps = (dispatch) => ({
  closeModal: () => dispatch(actions.closeModal()),
});

ViewerModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  modalData: PropTypes.object.isRequired,
  activeToolName: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewerModal);
