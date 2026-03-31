import { RefObject } from 'react';
import ReactQuill from 'react-quill';

export type NoteInputProps = {
  isUpdateContent?: boolean;
  placeholder?: string;
  onChange?: (content: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onKeyDown?: () => void;
  readOnly?: boolean;
  defaultContent?: string;
  shouldDisableToolBar?: boolean;
  shouldShowToolBar?: boolean;
  shouldLimitHeight?: boolean;
  annotation: Core.Annotations.Annotation;
  className?: string;
  inputRef: RefObject<ReactQuill>;
  setInputRef: (node: ReactQuill) => void;
  value?: string;
  onResize?: () => void;
  isCommentPopup?: boolean;
  isNoteHistory?: boolean;
  isFocused: boolean;
  onConfirm?: (e: React.KeyboardEvent) => void | Promise<void>;
  onContentValidation?: (hasContent: boolean) => void;
};

export type ValidEmailReturnValues = {
  isIncludedValidEmail: boolean;
  theFirstEmail: string;
  theLastEmail: string;
  startFormatPosition: number;
  endingFormatPosition: number;
};

export type TMentionData = {
  _id: string;
  email: string;
  name: string;
  avatarRemoteId: string;
};

export type TOnTagUserParams = {
  user?: TMentionData;
  shouldRemoveBreakLine?: boolean;
};
