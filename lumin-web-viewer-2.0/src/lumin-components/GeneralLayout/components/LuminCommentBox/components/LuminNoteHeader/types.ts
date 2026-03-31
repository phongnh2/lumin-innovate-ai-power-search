import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

type AnnotationType = Core.Annotations.StickyAnnotation;

export type DefaultStateProps = {
  currentDocument?: IDocumentBase;
  currentUser?: IUser;
  isOffline?: boolean;
  iconColor?: keyof AnnotationType;
  noteDateFormat?: string;
  activeToolStyle?: Record<string, unknown>;
};

export type DefaultDispatchProps = {
  openSignInModal?: () => void;
  setIsShowDeleteOverlay?: () => void;
};

export type LuminNoteHeaderProps = DefaultDispatchProps &
  DefaultStateProps & {
    noteTransformFunction?: boolean;
    annotation: AnnotationType;
    isResolved?: boolean;
    isCommentPanel?: boolean;
    isNoteHistory?: boolean;
    isCommentPopup?: boolean;
    onClickDelete?: () => void;
    onClose?: () => void;
    className?: string;
  };

export type UserData = {
  avatarRemoteId: string;
  email: string;
  id: string;
  name: string;
};
