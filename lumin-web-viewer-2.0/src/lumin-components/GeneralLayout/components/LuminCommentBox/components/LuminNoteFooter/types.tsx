export type LuminNoteFooterProps = {
  onConfirm: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  disabledConfirmButton?: boolean;
  disabledCancelButton?: boolean;
  isUpdateContent?: boolean;
  confirmButtonWording: string;
};
