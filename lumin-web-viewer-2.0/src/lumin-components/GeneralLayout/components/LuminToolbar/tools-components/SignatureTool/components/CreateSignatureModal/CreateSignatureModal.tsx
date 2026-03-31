import { Modal } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { connect } from 'react-redux';

import { toolbarActions } from '@new-ui/components/LuminToolbar/slices';
import { ToolName } from 'core/type';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { RootState } from 'store';

import getClassName from 'helpers/getClassName';

import { DataElements } from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';

import CreateSignatureModalContent from './CreateSignatureModalContent';
import './CreateSignatureModal.scss';

type CreateSignatureModalProps = {
  isOpen: boolean;
  closeSignatureModal: () => void;
  resetToolbarPopover: () => void;
};

const CreateSignatureModal = (props: CreateSignatureModalProps) => {
  const { isOpen = false, closeSignatureModal, resetToolbarPopover } = props;
  const className = getClassName('Modal SignatureModal', props);

  const onCloseSignatureModal = () => {
    closeSignatureModal();
    resetToolbarPopover();
    core.setToolMode(defaultTool as ToolName);
  };

  return (
    <Modal opened={isOpen} className={className} onClose={onCloseSignatureModal} size="lg">
      <CreateSignatureModalContent />
    </Modal>
  );
};

const mapStateToProps = (state: RootState) => ({
  isOpen: selectors.isElementOpen(state, DataElements.SIGNATURE_MODAL),
});

const mapDispatchToProps = {
  closeSignatureModal: () => actions.closeElement(DataElements.SIGNATURE_MODAL),
  resetToolbarPopover: () => toolbarActions.resetToolbarPopover(),
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateSignatureModal);
