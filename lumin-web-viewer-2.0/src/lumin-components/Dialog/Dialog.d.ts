interface IDialogProps {
  children?: React.ReactNode;
  classes?: Record<string, unknown>;
  className?: string;
  hasCloseBtn?: boolean;
  open?: boolean;
  themeMode?: string;
  width?: number | string;
  onClose?: () => void;
  noPadding?: boolean;
  scroll?: string;
  disableBackdropClick?: boolean;
  placement?: string;
  fullScreen?: boolean;
  disableEscapeKeyDown?: boolean;
  closeAfterTransition?: boolean;
  closeBtn?: Record<string, unknown>;
  PaperProps?: Record<string, unknown>;
}

/**
 * @deprecated use Dialog in lumin-ui/kiwi-ui instead
 */
declare const Dialog: (props: IDialogProps) => JSX.Element;

export default Dialog;
