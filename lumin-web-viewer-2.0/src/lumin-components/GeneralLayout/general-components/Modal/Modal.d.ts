import { PaperProps } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { ButtonProps } from 'lumin-ui/kiwi-ui';

interface ModalProps {
  children: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  footerVariant?: 'variant1' | 'variant2' | 'variant3' | null;
  header?: React.ReactNode;
  onClose?: () => void;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  open: boolean;
  primaryText?: string | React.ReactNode;
  secondaryText?: string;
  setIsChecker?: (value: boolean) => void;
  showCloseIcon?: boolean;
  size?: 'medium' | 'small' | 'large' | 'extra-large';
  title?: string;
  primaryButtonProps?: {
    isLoading?: boolean;
  } & ButtonProps;
  icon?: string | React.ReactNode;
  center?: boolean;
  elevation?: number;
  TransitionProps?: TransitionProps;
  PaperProps?: PaperProps;
}

declare const Modal: (props: ModalProps) => JSX.Element;

export default Modal;
