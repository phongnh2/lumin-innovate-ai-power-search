import { EnumAsStringUnion } from 'interfaces/common';
import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

export type DefaultDispatchProps = {
  finishNoteEditing?: () => void;
};

export type LuminCommentDefaultStateProps = {
  notePosition?: number;
  currentDocument?: IDocumentBase;
  currentUser?: IUser;
  isOffline?: boolean;
  isEdited?: boolean;
  sortStrategy?: string;
  isMyNoteToExport?: boolean;
  noteEditingAnnotationId?: string;
};

export type LuminCommentBoxProps = LuminCommentDefaultStateProps &
  DefaultDispatchProps & {
    annotation: Core.Annotations.StickyAnnotation;
    isCommentPanel?: boolean;
    isNoteHistory?: boolean;
    isCommentPopup?: boolean;
    closeCommentPopup?: () => void;
    // get this function from visualized list to calculate position
    onResize?: () => void;
    isSelected?: boolean;
    closeCommentPanel?: () => void;
    isContentEditable?: boolean;
    setEditingContent?: React.Dispatch<React.SetStateAction<boolean>>;
    isEligibleForFocus?: boolean;
  };

export type NoteStyles = {
  zIndex: number;
  top: number;
  opacity: number;
  minHeight: number;
};

export type ContextValues = {
  // get this function from visualized list to calculate position
  onResize?: () => void;
  resize?: () => void;
  isContentEditable: boolean;
  isSelected: boolean;
  editingContent: string;
  setEditingContent: (isEditing: boolean) => void;
  isCommentPopup: boolean;
  setIsFocusInput?: (status: boolean) => void;
  isFocusInput?: boolean;
  searchInput?: string;
  closeCommentPopup?: () => void;
  isNoteHistory?: boolean;
};

export type TReply = {
  email: string;
  content: string;
  time: string | Date;
};

export type InterceptorAnnotation = TReply & {
  comments: Array<{
    email: string;
    content: string;
    time?: string | Date;
  }>;
};

export enum FocusingInputValue {
  NewComment = 'newComment',
  ReplyContent = 'replyComment',
}

type AnnotationId = string;

export type FocusState = EnumAsStringUnion<FocusingInputValue> | AnnotationId | null;
