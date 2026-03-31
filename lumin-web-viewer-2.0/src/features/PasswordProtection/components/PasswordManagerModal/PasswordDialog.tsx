import { Modal, ModalProps } from 'lumin-ui/kiwi-ui';
import React from 'react';

type PasswordDialogProps = ModalProps & {
  children: React.ReactNode;
};

const PasswordDialog = ({ children, ...otherProps }: PasswordDialogProps) => (
  <Modal centered titleCentered hideDefaultButtons data-element="changePasswordModal" size="sm" {...otherProps}>
    {children}
  </Modal>
);

export default PasswordDialog;
