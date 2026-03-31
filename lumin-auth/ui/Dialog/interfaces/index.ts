import { DialogProps as MuiDialogProps } from '@mui/material';
import { ReactNode } from 'react';

import { DialogSize, DialogType } from '../types';

export type DialogProps = Omit<MuiDialogProps, 'size' | 'title'> & {
  open: boolean;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: (() => void) | undefined;
  size?: DialogSize;
};

export type ConfirmationDialogProps = DialogProps & {
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  disableConfirm?: boolean;
  onCancel?: () => void;
  type: DialogType;
  messageAlign: 'right' | 'center' | 'left' | 'justify';
};
