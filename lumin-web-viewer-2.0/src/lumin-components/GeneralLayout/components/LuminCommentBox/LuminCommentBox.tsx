import React, { useEffect, useRef, useState, ReactElement, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import core from 'core';
import { store } from 'store';

import { isComment } from 'lumin-components/CommentPanel/helper';
import { emitModifyParentNote } from 'lumin-components/NoteLumin/helpers';

import { useDocumentPermission, useTranslation } from 'hooks';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';
import setToolModeAndGroup from 'helpers/setToolModeAndGroup';

import commentUtils from 'utils/comment';
import socketUtils from 'utils/socketUtil';
import validator from 'utils/validator';

import CommentState from 'constants/commentState';
import { DRAGGABLE_COMMENT_CLASSNAME } from 'constants/commonConstant';
import { CUSTOM_DATA_COMMENT_HIGHLIGHT, CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';
import { ANNOTATION_ACTION } from 'constants/documentConstants';
import toolsName, { TOOLS_NAME } from 'constants/toolsName';

import {
  LuminNoteContent,
  LuminNoteFooter,
  LuminNoteHeader,
  LuminNoteInput,
  LuminDeleteCommentThread,
} from './components';
import { REPLIES_LIMITATION } from './constants';
import { LuminCommentBoxContext } from './context';
import { LuminCommentBoxProps, InterceptorAnnotation, FocusingInputValue, FocusState } from './types';
import { getCommentContents, getCommentReplies } from './utils';

import styles from './LuminCommentBox.module.scss';

const LuminCommentBox = ({
  isSelected = false,
  closeCommentPopup = (): void => {},
  isContentEditable = false,
  onResize = (): void => {},
  isNoteHistory = false,
  currentDocument,
  annotation,
  currentUser,
  isOffline,
  isCommentPanel,
  isCommentPopup,
  finishNoteEditing,
  isEdited,
  notePosition,
  isMyNoteToExport,
  noteEditingAnnotationId,
  isEligibleForFocus,
}: LuminCommentBoxProps): JSX.Element => {
  const [focusingInputValue, setFocusingInputValue] = useState<FocusState>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showLessReplies, setShowLessReplies] = useState<boolean>(true);
  const [showDeleteThread, setShowDeleteThread] = useState<boolean>(false);
  const [replyAnnotations, setReplyAnnotations] = useState<Core.Annotations.Annotation[]>(() =>
    getCommentReplies(annotation)
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

  const resizeObserver = useRef<ResizeObserver>();

  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const isReOpenByReply = useRef(false);
  const replyTextareaRef = useRef<ReactQuill | null>(null);

  const { canComment } = useDocumentPermission(currentDocument);

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onCompositionChange = useCallback((hasContent: boolean): void => {
    setIsButtonDisabled(!hasContent);
  }, []);

  useEffect(() => {
    if (focusingInputValue) {
      setIsButtonDisabled(true);
    }
  }, [focusingInputValue]);

  const annotManager = core.getAnnotationManager();
  const isCommentAnnotation = isComment(annotation);
  const isResolved = isCommentAnnotation && annotation.getState() === CommentState.Resolved.state;
  const withHighlightAnno = core
    .getAnnotationsList()
    .find((anno) => anno.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key) === annotation.Id);
  const hideReplyInput = (!getCommentContents(annotation) && isCommentAnnotation) || !isSelected || !canComment;

  const primaryReply = {
    email: annotation.Author,
    content: getCommentContents(annotation),
    time: annotation.DateCreated,
  };

  const replies = annotation
    .getReplies()
    .map((item) => ({
      email: item.Author,
      content: getCommentContents(item),
      time: item.DateCreated,
    }))
    .concat([primaryReply]);

  const interceptorAnnotation = (): InterceptorAnnotation => ({
    ...primaryReply,
    comments: replies,
  });

  const handleAddReply = (
    replyAnnot: {
      getStateModel: () => string;
      setState: (arg0: string) => void;
    },
    _parent: any,
    root: any
  ): void => {
    if (isReOpenByReply.current && replyAnnot.getStateModel() !== 'Marked' && isComment(root)) {
      replyAnnot.setState(CommentState.Cancelled.state);
      isReOpenByReply.current = false;
    }
  };

  const onAnnotationContentUpdate = (annotationUpdated: Core.Annotations.Annotation[], action: string): void => {
    if ([ANNOTATION_ACTION.DELETE, ANNOTATION_ACTION.ADD].includes(action)) {
      const replyAnnots = getCommentReplies(annotation);
      setReplyAnnotations(replyAnnots);
    }
    let isMovingNewCommentAnnot = false;
    if (annotationUpdated?.[0] && annotation && annotationUpdated[0].Id === annotation.Id) {
      onResize();
      isMovingNewCommentAnnot =
        annotationUpdated.length === 1 &&
        isSelected &&
        isContentEditable &&
        !getCommentContents(annotation) &&
        !annotation.getCustomData(CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.key);
    }

    if (!isMovingNewCommentAnnot) {
      setFocusingInputValue(null);
    }
  };

  const resetTextEditor = (): void => {
    setReplyContent('');
    if (replyTextareaRef.current) {
      replyTextareaRef.current.blur();
      const editor = replyTextareaRef.current.getEditor();
      editor.deleteText(0, editor.getLength());
    }
  };

  const onCloseCommentPopup = useCallback(() => {
    finishNoteEditing();
    core.deselectAllAnnotations();
    closeCommentPopup();
  }, [finishNoteEditing, closeCommentPopup]);

  const onCancelReply = (): void => {
    resetTextEditor();
    setFocusingInputValue(null);
    if (isCommentPopup) {
      onCloseCommentPopup();
    }
  };

  useEffect(() => {
    if (isNoteHistory) {
      return undefined;
    }
    const resizeObserverHandler: ResizeObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.contentBoxSize || entry.contentRect) {
          onResize?.();
        }
      });
    };
    resizeObserver.current = new ResizeObserver(resizeObserverHandler);
    resizeObserver.current.observe(containerRef.current);

    return () => {
      resizeObserver.current.disconnect();
    };
  }, [isNoteHistory]);

  useEffect(() => {
    core.addEventListener('annotationChanged', onAnnotationContentUpdate);
    core.addEventListener('addReply', handleAddReply);
    return (): void => {
      core.removeEventListener('annotationChanged', onAnnotationContentUpdate);
      core.removeEventListener('addReply', handleAddReply);
    };
  }, []);

  useEffect(() => {
    if (isSelected && isContentEditable && !getCommentContents(annotation)) {
      setFocusingInputValue(isEdited ? FocusingInputValue.NewComment : null);
    }
  }, [isContentEditable, isSelected, isEdited, annotation]);

  useEffect(() => {
    if (isSelected && isContentEditable && innerRef.current && isEligibleForFocus) {
      innerRef.current.focus();
    }
  }, [isSelected, isContentEditable, isEligibleForFocus]);

  useEffect(() => {
    if ((!isSelected || !isContentEditable || !innerRef.current) && !isCommentPopup) {
      onCancelReply();
    }
  }, [isSelected, isContentEditable, isCommentPopup]);

  useEffect(() => {
    if (
      isSelected &&
      isContentEditable &&
      isNoteHistory &&
      noteEditingAnnotationId &&
      noteEditingAnnotationId === annotation.Id
    ) {
      replyTextareaRef.current.focus();
      setFocusingInputValue(FocusingInputValue.ReplyContent);
      dispatch(actions.setNoteEditingAnnotationId(''));
    }
  }, [isSelected, isContentEditable, isNoteHistory, noteEditingAnnotationId]);

  const handleShowReplies = (): void => {
    setShowLessReplies((preState) => !preState);
  };

  const getShowHideContent = (numberOfHiddenRelies = 0): string | ReactElement => {
    if (showLessReplies) {
      return t('common.showMoreReplies', { number: numberOfHiddenRelies });
    }
    return (
      <>
        <i className={`icon-collapse-to-top ${styles.customIcon}`} style={{ fontSize: '12px' }} />
        {t('common.hideOlderReplies')}
      </>
    );
  };

  const handleNoteClick = (e: MouseEvent): void => {
    // isCommentPopup allow user to drag
    if (e && !isCommentPopup) {
      e.stopPropagation();
    }

    if (isMyNoteToExport) {
      return;
    }

    if (core.getToolMode()?.name === TOOLS_NAME.FREEHAND) {
      setToolModeAndGroup(store, TOOLS_NAME.EDIT);
    }

    if (!isSelected) {
      core.deselectAllAnnotations();
      core.selectAnnotation(annotation);
      core.jumpToAnnotation(annotation);
      if (withHighlightAnno) {
        core.selectAnnotation(withHighlightAnno);
        core.jumpToAnnotation(withHighlightAnno);
      }
    }
  };

  const renderButtonShowOrHideReplies = (hiddenReplies: Array<Core.Annotations.Annotation>): ReactElement => (
    <button
      type="button"
      className={styles.showHideButton}
      onClick={handleShowReplies}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleShowReplies();
        }
      }}
    >
      <div className={styles.showHideContainer} data-is-showing-less={showLessReplies}>
        <span className={styles.statusContent} data-is-showing-less={showLessReplies}>
          {' '}
          {getShowHideContent(hiddenReplies.length)}
        </span>
      </div>
    </button>
  );

  const renderReplies = (replyList: Array<Core.Annotations.Annotation>): ReactElement => (
    <>
      {replyList.map((reply: Core.Annotations.StickyAnnotation) => (
        <LuminNoteContent
          key={reply.Id}
          annotation={reply}
          isCommentPanel={isCommentPanel}
          isNoteHistory={isNoteHistory}
        />
      ))}
    </>
  );

  const renderHiddenReplies = (hiddenReplies: Array<Core.Annotations.Annotation>): ReactElement => (
    <>
      {!showLessReplies && renderReplies(hiddenReplies)}
      {renderButtonShowOrHideReplies(hiddenReplies)}
    </>
  );

  const renderRepliesWithHiddenCondition = (): ReactElement => {
    const { length } = replyAnnotations;
    if (length < 5) {
      return renderReplies(replyAnnotations);
    }

    const _replies = [...replyAnnotations];

    const head = _replies.splice(0, REPLIES_LIMITATION.HEAD);
    const body = _replies.splice(0, _replies.length - REPLIES_LIMITATION.TAIL);
    const tail = [..._replies];

    return (
      <div className={styles.replyContainer}>
        {renderReplies(head)}
        {renderHiddenReplies(body)}
        {renderReplies(tail)}
      </div>
    );
  };

  const onChangeReply = (value: string): void => {
    setReplyContent(value);
  };

  const setCommentResolve = async (newStatus: boolean, method = 'button'): Promise<void> => {
    if (newStatus !== isResolved) {
      await emitModifyParentNote(newStatus, annotation, withHighlightAnno, currentDocument, currentUser, isOffline);
    }

    if (newStatus) {
      annotManager.updateAnnotationState(
        annotation,
        CommentState.Resolved.state,
        'Review',
        t(CommentState.Resolved.message)
      );
    } else if (isResolved && method === 'button') {
      annotManager.updateAnnotationState(annotation, CommentState.Open.state, 'Review', t(CommentState.Open.message));
    }
  };

  const onPostReply = async (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent): Promise<void> => {
    e.preventDefault();
    await setCommentResolve(false, 'reply');
    const annotationData = interceptorAnnotation();
    const currentReplyContent = replyContent && replyContent.trim();

    if (commentUtils.removeHTMLTag(currentReplyContent)) {
      if (isResolved) {
        isReOpenByReply.current = true;
      }
      const repliedAnnot = core.createAnnotationReply(annotation, commentUtils.removeHTMLTag(currentReplyContent));
      repliedAnnot.setCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key, currentReplyContent.toString());
      repliedAnnot.setCustomData(
        CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.key,
        CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.added
      );
      core
        .getAnnotationManager()
        .trigger(core.Events.ANNOTATION_CHANGED, [[repliedAnnot], ANNOTATION_ACTION.MODIFY, {}]);
      const { _id } = currentDocument;
      const commentAuthor = annotation.Author;
      const emailsFromContent = commentUtils.getEmailsFromContent(
        currentUser,
        commentUtils.removeHTMLTag(replyContent.trim())
      );
      const commenterEmails = Array.from(
        new Set(replies.filter((item) => currentUser?.email !== item.email).map((item) => item.email))
      );
      if (currentUser) {
        const { name } = currentUser;
        const commenter = {
          name,
          id: currentUser._id,
        };
        if (emailsFromContent.length > 0) {
          socketUtils.socketEmitSendEmailMention(
            commenter,
            _id,
            replyContent.trim(),
            annotationData,
            emailsFromContent
          );
        }

        const areAllEmailsNotCommentAuthor = emailsFromContent.every((taggedEmail) => taggedEmail !== commentAuthor);
        const nonMentionedUsers = commenterEmails.filter(
          (replyEmail) => validator.isEmail(replyEmail) && !emailsFromContent.find((email) => email === replyEmail)
        );

        if (
          areAllEmailsNotCommentAuthor &&
          replies.length > 0 &&
          (nonMentionedUsers.length > 0 || validator.isEmail(commentAuthor))
        ) {
          socketUtils.socketEmitSendEmailReply(
            commenter,
            _id,
            commentAuthor,
            nonMentionedUsers,
            annotationData,
            replyContent
          );
        }
      }
    }
    resetTextEditor();
    replyTextareaRef.current?.focus();
  };

  const onCancelEditComment = (): void => {
    setFocusingInputValue(null);
    onCloseCommentPopup();
  };

  const onCreatedComment = (): void => {
    finishNoteEditing();
    setFocusingInputValue(FocusingInputValue.ReplyContent);
  };

  const forwardReplyRefCallBack = (node: ReactQuill): void => {
    replyTextareaRef.current = node;
  };

  const renderReplyInput = (): ReactElement => {
    if (hideReplyInput) {
      return null;
    }
    const placeholder = isResolved ? 'viewer.noteContent.addCommentAndReopen' : 'action.commentAndMention';

    const isReplyContent = focusingInputValue === FocusingInputValue.ReplyContent;

    return (
      <>
        <LuminNoteInput
          isFocused={isReplyContent}
          annotation={annotation}
          onChange={onChangeReply}
          onFocus={() => setFocusingInputValue(FocusingInputValue.ReplyContent)}
          inputRef={replyTextareaRef}
          setInputRef={forwardReplyRefCallBack}
          value={replyContent}
          shouldLimitHeight={isCommentPopup}
          placeholder={placeholder}
          isCommentPopup={isCommentPopup}
          isNoteHistory={isNoteHistory}
          onConfirm={onPostReply}
          onContentValidation={onCompositionChange}
        />
        {isReplyContent && (
          <LuminNoteFooter
            onConfirm={onPostReply}
            onCancel={onCancelReply}
            disabledConfirmButton={isButtonDisabled}
            confirmButtonWording="action.reply"
          />
        )}
      </>
    );
  };

  const onDeleteThread = (): void => {
    if (withHighlightAnno) {
      core.deleteAnnotations([annotation, withHighlightAnno], {});
    } else {
      core.deleteAnnotations([annotation], {});
    }
  };

  const getStyle = useCallback(() => {
    if (isNoteHistory || isCommentPopup) {
      return {};
    }

    return {
      zIndex: isSelected ? 2 : 1,
      top: notePosition,
      opacity: notePosition ? 1 : 0,
    };
  }, [isCommentPopup, isNoteHistory, isSelected, notePosition]);

  const renderNoteContent = (): React.ReactElement => (
    <div ref={innerRef}>
      {showDeleteThread && (
        <LuminDeleteCommentThread
          onDeleteThread={onDeleteThread}
          onCancelDelete={() => setShowDeleteThread(false)}
          isCommentAnnotation={isCommentAnnotation}
        />
      )}
      <LuminNoteHeader
        annotation={annotation}
        onClickDelete={() => setShowDeleteThread(true)}
        isCommentPopup={isCommentPopup}
        isNoteHistory={isNoteHistory}
        onClose={onCloseCommentPopup}
        {...(isCommentPopup && { className: DRAGGABLE_COMMENT_CLASSNAME })}
      />
      <LuminNoteContent
        isCommentPopup={isCommentPopup}
        annotation={annotation}
        isNoteHistory={isNoteHistory}
        isCommentPanel={isCommentPanel}
        onCancelEditComment={onCancelEditComment}
        onCreatedComment={onCreatedComment}
      />
      {renderRepliesWithHiddenCondition()}
      {renderReplyInput()}
    </div>
  );

  const contextValues = useMemo(
    () => ({
      isSelected,
      isResolved,
      closeCommentPopup: onCloseCommentPopup,
      focusingInputValue,
      setFocusingInputValue,
      isButtonDisabled,
      onCompositionChange,
    }),
    [
      isSelected,
      onCloseCommentPopup,
      focusingInputValue,
      setFocusingInputValue,
      isResolved,
      isButtonDisabled,
      onCompositionChange,
    ]
  );

  return (
    <LuminCommentBoxContext.Provider value={contextValues}>
      <div className={styles.container} data-cy={`comment_box_${annotation.Id}`}>
        <div
          className={styles.commentBoxContainer}
          data-is-comment-panel={isCommentPanel}
          data-is-selected={isSelected}
          data-is-resolved={isResolved}
          ref={containerRef}
          id={annotation.Id}
          data-hide-reply-input={hideReplyInput}
          data-is-note-history={isNoteHistory}
          role="button"
          tabIndex={0}
          onMouseDown={handlePromptCallback({
            callback: handleNoteClick,
            applyForTool: toolsName.REDACTION,
          })}
          style={getStyle()}
        >
          {renderNoteContent()}
        </div>
      </div>
    </LuminCommentBoxContext.Provider>
  );
};

LuminCommentBox.defaultProps = {
  isCommentPanel: false,
  isCommentPopup: false,
  onResize: () => {},
  measure: () => {},
  isEligibleForFocus: true,
};

export default LuminCommentBox;
