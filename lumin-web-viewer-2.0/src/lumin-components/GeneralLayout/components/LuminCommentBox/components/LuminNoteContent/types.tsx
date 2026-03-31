import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

export type LuminNoteContentDefaultProps = {
  isOffline?: boolean;
  currentUser?: IUser;
  currentDocument?: IDocumentBase;
  noteDateFormat?: string;
  iconColor?: string;
  isEdited?: boolean;
};

export type LuminNoteContentDefaultDispatchProps = {
  openSignInModal?: () => void;
  closeViewerModal?: () => void;
  openViewerModal?: (props: object) => void;
};

export type LuminNoteContentProps = LuminNoteContentDefaultProps &
  LuminNoteContentDefaultDispatchProps & {
    annotation: Core.Annotations.StickyAnnotation;
    isCommentPanel?: boolean;
    isNoteHistory?: boolean;
    onCancelEditComment?: () => void;
    onCreatedComment?: () => void;
    onResize?: () => void;
    isCommentPopup?: boolean;
  };

export type TInterceptorAnnotation = {
  ownerEmail: string;
  ownerComment: string;
  comments: Array<{
    email: string;
    content: string;
  }>;
};
