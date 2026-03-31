import { escape as lodashEscape } from 'lodash';
import React, { useState, useEffect, ReactElement, useRef } from 'react';
import ReactQuill from 'react-quill';
import { useTheme } from 'styled-components';

import LuminNoteFooter from '@new-ui/components/LuminCommentBox/components/LuminNoteFooter';
import LuminNoteHeader from '@new-ui/components/LuminCommentBox/components/LuminNoteHeader';
import LuminNoteInput from '@new-ui/components/LuminCommentBox/components/LuminNoteInput';

import core from 'core';

import { isComment } from 'lumin-components/CommentPanel/helper';

import { commandHandler } from 'HOC/OfflineStorageHOC';

import { useTranslation } from 'hooks/useTranslation';

import exportAnnotationCommand from 'helpers/exportAnnotationCommand';

import commentUtils from 'utils/comment';
import socketUtils from 'utils/socketUtil';

import { useCommentContentState } from 'features/Comments/hooks';

import CommentState from 'constants/commentState';
import {
  CUSTOM_DATA_COMMENT_HIGHLIGHT,
  CUSTOM_DATA_TEXT_TOOL,
  CUSTOM_DATA_COMMENT,
} from 'constants/customDataConstant';
import { AnnotationSubjectMapping, ANNOTATION_ACTION } from 'constants/documentConstants';

import { LuminNoteContentProps, TInterceptorAnnotation } from './types';
import { useLuminCommentBoxContext } from '../../hooks';
import { FocusingInputValue } from '../../types';
import { CollapsibleComment } from '../CollapsibleComment';

import * as Styled from './LuminNoteContent.styled';

const DATA_CANCEL_BUTTON_IDENTITY = 'comment-content-cancel-button';
const ICON_SIZE = 16;
const LuminNoteContent = ({
  closeViewerModal,
  openViewerModal,
  annotation,
  currentUser,
  isNoteHistory = true,
  onCancelEditComment,
  currentDocument,
  isCommentPopup = false,
  isOffline = false,
  onCreatedComment = () => {},
}: LuminNoteContentProps): ReactElement => {
  const theme = useTheme();
  const {
    isSelected = false,
    closeCommentPopup,
    setFocusingInputValue,
    focusingInputValue,
    isButtonDisabled,
    onCompositionChange,
  } = useLuminCommentBoxContext();
  const { content, setContent } = useCommentContentState({
    annotation,
    currentUser,
    openViewerModal,
    closeViewerModal,
  });

  const { t } = useTranslation();

  const [editingMainComment, setEditingMainComment] = useState<string>('');
  const [replyContent, setReplyContent] = useState<string>('');
  const [shouldShowHighlightArrow, setShouldShowHighlightArrow] = useState<boolean>(false);
  const [isShowFullHighlight, setIsShowFullHighlight] = useState<boolean>(false);

  const isReply: boolean = annotation.isReply();
  const highlightText = annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key);
  const isCommentAnnotation = isComment(annotation);
  const noteState = isCommentAnnotation ? annotation.getState() : '';
  const reopenReply = isCommentAnnotation && noteState === CommentState.Cancelled.state;
  const keepReplyStatus = isCommentAnnotation && noteState === CommentState.Rejected.state;
  const styledComment = annotation.getCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key);
  const contents =
    styledComment || annotation.getContents() || annotation.getCustomData(CUSTOM_DATA_TEXT_TOOL.CONTENT.key);

  const highlightTextRefContainer = useRef(null);
  const highLightTextRef = useRef(null);
  const inputCommentRef = useRef(null);
  const inputReplyRef = useRef<ReactQuill | null>(null);

  const findHighlightCommandAndOverride = async (annot: Core.Annotations.Annotation): Promise<void> => {
    await commandHandler.findCommandAndOverride({
      documentId: currentDocument._id,
      annotationId: annot.Id,
      overrideObj: {
        annotationType: AnnotationSubjectMapping.removal,
        annotationAction: ANNOTATION_ACTION.DELETE,
        xfdf: exportAnnotationCommand(annot, ANNOTATION_ACTION.DELETE),
      },
    });
  };

  const deleteEmptyAnnot = async (): Promise<void> => {
    const highlightAnnos = core
      .getAnnotationsList()
      .filter(
        (annot) =>
          annot.Subject === AnnotationSubjectMapping.highlight &&
          annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key)
      );

    const highlightToDelete = highlightAnnos.find(
      (e) => e.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key) === annotation.Id
    );

    if (highlightToDelete) {
      core.deleteAnnotations([highlightToDelete]);
      if (isOffline) {
        await findHighlightCommandAndOverride(highlightToDelete);
      }
    }
    core.deleteAnnotations([annotation]);
  };

  const interceptorAnnotation = (annotationData: Core.Annotations.Annotation): TInterceptorAnnotation => ({
    ownerEmail: annotationData.Author,
    ownerComment: annotationData.getContents(),
    comments: annotationData.getReplies().map((cmt) => ({
      email: cmt.Author,
      content: cmt.getContents(),
    })),
  });

  const sendEmail = (commentContent: string, taggedEmail: string[] = []): void => {
    const { _id } = currentDocument;
    if (!currentUser) {
      socketUtils.socketEmitSendEmailComment({ name: 'Anonymous' }, _id, new Date(), commentContent);
      return;
    }

    if (!taggedEmail.length) {
      return;
    }

    const { name } = currentUser;
    const commenter = {
      name,
      id: currentUser._id,
    };

    const annotationData = interceptorAnnotation(annotation);
    socketUtils.socketEmitSendEmailMention(commenter, _id, commentContent, annotationData, taggedEmail);
  };

  const addCustomDataAndTriggerAnnotationChanged = () => {
    if (highlightText) {
      const highlight = core
        .getAnnotationsList()
        .find((annot) => annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key) === annotation.Id);
      if (highlight) {
        // !contents when a new highlight annotation was just created
        if (!contents) {
          highlight.setCustomData(
            CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_HAS_CONTENT.key,
            CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_HAS_CONTENT.hasValue
          );
        } else {
          highlight.DateModified = annotation.DateModified;
        }
        core.getAnnotationManager().trigger('annotationChanged', [[highlight], ANNOTATION_ACTION.MODIFY, {}]);
      }
    }
  };

  const setContents = async (
    e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent | typeof window.event,
    isReplyAnnot = true
  ): Promise<void> => {
    const beingEditedContent = isReplyAnnot ? replyContent : editingMainComment;
    const editingContentWithoutStyle = commentUtils.removeHTMLTag(beingEditedContent).trim();
    const defaultContentWithoutStyle = commentUtils.removeHTMLTag(commentUtils.redoMarkupSymbol(contents)).trim();
    const hasEdited = editingContentWithoutStyle && editingContentWithoutStyle !== defaultContentWithoutStyle;
    // prevent the textarea from blurring out which will unmount these two buttons
    e.preventDefault();

    addCustomDataAndTriggerAnnotationChanged();

    if (!beingEditedContent || !contents || beingEditedContent.trim() !== contents.trim()) {
      const removedMarkupSymbol = commentUtils.clearAllMarkupSymbol(beingEditedContent.trim());
      setContent(lodashEscape(removedMarkupSymbol));
      annotation.setCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key, beingEditedContent);

      const commentStatusKey: string = CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.key;
      const isAddedCommentContent = !defaultContentWithoutStyle && editingContentWithoutStyle;
      const commentStatusValue: string = isAddedCommentContent
        ? CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.added
        : CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.edited;
      annotation.setCustomData(commentStatusKey, commentStatusValue);

      core.setNoteContents(annotation, editingContentWithoutStyle);

      if (annotation instanceof window.Core.Annotations.FreeTextAnnotation) {
        await core.drawAnnotationsFromList([annotation]);
      }
    }

    // if user only changes the style, we should not send notification
    if (hasEdited) {
      setFocusingInputValue(null);
      const commentContent = beingEditedContent.trim();
      const emailsFromContent = commentUtils.getEmailsFromContent(currentUser, editingContentWithoutStyle);

      const { _id, ownerId } = currentDocument;
      if (currentUser) {
        const { name } = currentUser;
        const commenter = {
          name,
          id: currentUser._id,
        };
        const shouldSendEmailComment =
          currentUser._id !== ownerId &&
          (!emailsFromContent.length || emailsFromContent.every((taggedEmail) => taggedEmail !== annotation.Author));
        if (shouldSendEmailComment) {
          socketUtils.socketEmitSendEmailComment(commenter, _id, new Date(), commentContent);
        }
      }
      sendEmail(commentContent, emailsFromContent);
    }
    onCreatedComment();
  };

  const onPostReply = async (
    e: typeof window.event | React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent,
    needToDeselect = true
  ): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    addCustomDataAndTriggerAnnotationChanged();

    if (commentUtils.removeHTMLTag(replyContent.trim())) {
      await setContents(e, true);
    }

    if (needToDeselect && !contents) {
      core.deselectAnnotation(annotation);
    }
    if (inputReplyRef.current) {
      const editor = inputReplyRef.current.getEditor();
      editor.deleteText(0, editor.getLength());
    }
    setFocusingInputValue(null);
  };

  const onAnnotationSelected = async (_annotations: Core.Annotations.Annotation[], action: string): Promise<void> => {
    if (action === ANNOTATION_ACTION.DESELECTED && isComment(annotation)) {
      if (!annotation.getContents()) {
        const target = window.event.target as HTMLElement;
        const isCancelButton = target.dataset.identity === DATA_CANCEL_BUTTON_IDENTITY;
        if (commentUtils.removeHTMLTag(replyContent.trim()).trim() && !isCancelButton) {
          await onPostReply(window.event, false);
        } else {
          await deleteEmptyAnnot();
        }
      }
      if (isCommentPopup) {
        closeCommentPopup();
      }
    }
  };

  useEffect(() => {
    if (highLightTextRef.current && highlightTextRefContainer.current) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const width = highLightTextRef.current.clientWidth as number;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (width > highlightTextRefContainer.current.clientWidth) {
        setShouldShowHighlightArrow(true);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    core.addEventListener('annotationSelected', onAnnotationSelected);
    return () => {
      core.removeEventListener('annotationSelected', onAnnotationSelected);
    };
  }, []);

  useEffect(() => {
    if (!isSelected) {
      setIsShowFullHighlight(false);
    }
  }, [isSelected]);

  const forwardCommentInputRefCallBack = (node: ReactQuill): void => {
    inputCommentRef.current = node;
  };

  const forwardReplyInputRefCallBack = (node: ReactQuill): void => {
    inputReplyRef.current = node;
  };

  const renderEditReply = (): ReactElement | string => {
    const isAnnotFocused = focusingInputValue === annotation.Id;
    if (!isAnnotFocused || !isSelected) {
      return <CollapsibleComment content={content} />;
    }

    return (
      <>
        <LuminNoteInput
          isFocused
          annotation={annotation}
          isUpdateContent
          defaultContent={contents}
          onChange={setReplyContent}
          value={replyContent}
          inputRef={inputReplyRef}
          setInputRef={forwardReplyInputRefCallBack}
          shouldLimitHeight={!isNoteHistory}
          isCommentPopup={isCommentPopup}
          isNoteHistory={isNoteHistory}
          onConfirm={onPostReply}
          onContentValidation={onCompositionChange}
        />
        <LuminNoteFooter
          isUpdateContent
          onConfirm={onPostReply}
          onCancel={() => setFocusingInputValue(null)}
          confirmButtonWording="action.save"
          disabledConfirmButton={isButtonDisabled}
        />
      </>
    );
  };

  const handleClickHighlight = (): void => {
    if (!isSelected) {
      return;
    }
    setIsShowFullHighlight((preState) => !preState);
  };

  const renderHightLightContent = (): ReactElement => {
    if (!isNoteHistory || !highlightText) {
      return null;
    }
    return (
      <Styled.HightLightWrapper ref={highlightTextRefContainer} onClick={handleClickHighlight}>
        <Styled.HightLightContent
          ref={highLightTextRef}
          shouldShowHighlightArrow={shouldShowHighlightArrow}
          isShowFullHighlight={isShowFullHighlight}
        >
          {highlightText}
        </Styled.HightLightContent>
        {shouldShowHighlightArrow && (
          <Styled.ArrowIcon
            className={`icon-${isShowFullHighlight ? 'light-arrow-up' : 'light-arrow-down'}`}
            size={ICON_SIZE}
            color={theme.kiwi_colors_core_on_secondary_container}
          />
        )}
      </Styled.HightLightWrapper>
    );
  };

  const renderNoteStatus = (): ReactElement | null => {
    if (!reopenReply && !keepReplyStatus) {
      return null;
    }
    const statusClass = content ? 'reopened' : '';
    return (
      <div>
        {reopenReply && <p className={statusClass}>{t(`${CommentState.Cancelled.message}`)}</p>}
        {keepReplyStatus && <p className={statusClass}>{t(`${CommentState.Rejected.message}`)}</p>}
      </div>
    );
  };

  const getMainCommentContent = (): string | ReactElement => {
    const annotFocusing = [FocusingInputValue.NewComment, annotation.Id];
    const isFocused = annotFocusing.includes(String(focusingInputValue));

    if (!isFocused) {
      return <CollapsibleComment content={content} annotation={annotation} />;
    }

    return (
      <>
        <LuminNoteInput
          isFocused
          annotation={annotation}
          isUpdateContent
          defaultContent={contents}
          onChange={setEditingMainComment}
          value={editingMainComment}
          inputRef={inputCommentRef}
          setInputRef={forwardCommentInputRefCallBack}
          shouldLimitHeight={!isNoteHistory}
          isCommentPopup={isCommentPopup}
          isNoteHistory={isNoteHistory}
          onConfirm={(e: React.KeyboardEvent) => setContents(e, false)}
          onContentValidation={onCompositionChange}
        />
        <LuminNoteFooter
          isUpdateContent
          onConfirm={(e: React.MouseEvent<HTMLElement, MouseEvent>) => setContents(e, false)}
          onCancel={onCancelEditComment}
          disabledConfirmButton={isButtonDisabled}
          confirmButtonWording={focusingInputValue === FocusingInputValue.NewComment ? 'action.comment' : 'action.save'}
        />
      </>
    );
  };

  const renderNoteContent = (): string | ReactElement => {
    if (!isReply) {
      return getMainCommentContent();
    }

    return (
      <Styled.ReplyContainer>
        <LuminNoteHeader annotation={annotation} />
        {renderNoteStatus()}
        {renderEditReply()}
      </Styled.ReplyContainer>
    );
  };

  return (
    <Styled.ContentContainer isReply={isReply} isSelected={isSelected}>
      {renderHightLightContent()}
      {renderNoteContent()}
    </Styled.ContentContainer>
  );
};

export default LuminNoteContent;
