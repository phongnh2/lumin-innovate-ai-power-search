/* eslint-disable sonarjs/cognitive-complexity */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ButtonMaterial from 'lumin-components/ViewerCommon/ButtonMaterial';
import { isComment } from 'luminComponents/CommentPanel/helper';
import CommentContext from 'luminComponents/NoteCommentBox/CommentContext';
import NoteInput from 'luminComponents/NoteInput';
import NoteContext from 'luminComponents/NoteLumin/Context';

import { useTranslation } from 'hooks';
import useDidUpdate from 'hooks/useDidUpdate';

import getCurrentRole from 'helpers/getCurrentRole';

import { comment, socketUtil, validator } from 'utils';

import { CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';
import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { DOCUMENT_ROLES } from 'constants/lumin-common';

const ReplyArea = ({
  annotation, handleReplyReopen, replyTextareaRef, isResolved, changeIsReOpenByReply, isCommentPanel, triggerResize
}) => {
  const [
    currentUser,
    currentDocument,
    isReadOnly,
    isReplyDisabled,
    isReplyDisabledForAnnotation,
    isNoteEditingTriggeredByAnnotationPopup,
  ] = useSelector(
    (state) => [
      selectors.getCurrentUser(state),
      selectors.getCurrentDocument(state),
      selectors.isDocumentReadOnly(state),
      selectors.isElementDisabled(state, 'noteReply'),
      selectors.getIsReplyDisabled(state)?.(annotation),
      selectors.getIsNoteEditing(state),
    ],
    shallowEqual,
  );
  const {
    resize = () => { },
    isContentEditable,
    isSelected,
    editingContent = '',
    setEditingContent = () => { },
    isCommentPopup = false
  } = useContext(isCommentPanel ? CommentContext : NoteContext);
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState(editingContent || '');
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const currentDocumentRole = getCurrentRole(currentDocument);
  const placeHolderText = isResolved
    ? t('viewer.noteContent.addCommentAndReopen')
    : t('action.commentAndMention');
  const isCommentAnnotation = isComment(annotation);

  const getCommentContents = (annotation) =>
    comment.redoMarkupSymbol(
      annotation.getCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key) || annotation.getContents()
    );

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

  const interceptorAnnotation = () => ({
    ...primaryReply,
    comments: replies.sort((a, b) => a.time.getTime() - b.time.getTime()),
  });

  useDidUpdate(() => {
    if (!isFocused) {
      dispatch(actions.finishNoteEditing());
    }
    resize();
  }, [isFocused]);

  useEffect(() => {
    if (
      isNoteEditingTriggeredByAnnotationPopup &&
      isSelected &&
      isContentEditable &&
      replyTextareaRef.current &&
      !isCommentAnnotation
    ) {
      replyTextareaRef.current.focus();
    }
  }, [isContentEditable, isNoteEditingTriggeredByAnnotationPopup, isSelected]);

  useEffect(() => {
    triggerResize();
  }, []);

  const resetTextEditor = () => {
    setValue('');
    setEditingContent('');
    replyTextareaRef.current.blur();
    const editor = replyTextareaRef.current.getEditor();
    editor.deleteText(0, editor.getLength());
  };

  const postReply = async (e) => {
    e.preventDefault();
    await handleReplyReopen();

    const annotationData = interceptorAnnotation();
    const replyContent = value && value.trim();

    if (comment.removeHTMLTag(replyContent)) {
      if (isResolved) {
        changeIsReOpenByReply(true);
      }
      const repliedAnnot = core.createAnnotationReply(annotation, comment.removeHTMLTag(replyContent));
      repliedAnnot.setCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key, replyContent.toString());
      repliedAnnot.setCustomData(
        CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.key,
        CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.added
      );
      core
        .getAnnotationManager()
        .trigger(core.Events.ANNOTATION_CHANGED, [[repliedAnnot], ANNOTATION_ACTION.MODIFY, {}]);
      const { _id } = currentDocument;
      const commentAuthor = annotation.Author;
      const emailsFromContent = comment.getEmailsFromContent(currentUser, comment.removeHTMLTag(value.trim()));
      const commenterEmails = Array.from(
        new Set(
          replies
            .filter((item) => currentUser?.email !== item.email)
            .map((item) => item.email),
        ),
      );
      if (currentUser) {
        const { name } = currentUser;
        const commenter = {
          name,
          id: currentUser._id,
        };
        if (emailsFromContent.length > 0) {
          socketUtil.socketEmitSendEmailMention(
            commenter,
            _id,
            value.trim(),
            annotationData,
            emailsFromContent,
          );
        }

        const areAllEmailsNotCommentAuthor = emailsFromContent.every(
          (taggedEmail) => taggedEmail !== commentAuthor,
        );
        const nonMentionedUsers = commenterEmails.filter(
          (replyEmail) => validator.isEmail(replyEmail) && !emailsFromContent.find((email) => email === replyEmail),
        );
        if (
          areAllEmailsNotCommentAuthor &&
          replies.length > 0 &&
          (validator.isEmail(commentAuthor) || nonMentionedUsers.length)
        ) {
          socketUtil.socketEmitSendEmailReply(
            commenter,
            _id,
            commentAuthor,
            nonMentionedUsers,
            annotationData,
            replyContent,
          );
        }
      }
    }
    resetTextEditor();
  };

  const handleCancelClick = () => {
    resetTextEditor();
  };

  const replyBtnClass = classNames({
    disabled: !value || !value.trim(),
  });
  const onChange = (value) => {
    setValue(value);
    setEditingContent(value);
  };

  const isCommentNoContent = isCommentPanel && !annotation.getContents();

  const ifReplyNotAllowed =
    isReadOnly ||
    isReplyDisabled ||
    isReplyDisabledForAnnotation ||
    currentDocumentRole === DOCUMENT_ROLES.SPECTATOR ||
    (isNoteEditingTriggeredByAnnotationPopup && (!isContentEditable || isCommentNoContent));

  return ifReplyNotAllowed ? null : (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="reply-container"
      // stop bubbling up otherwise the note will be closed
      // due to annotation deselection
      onMouseDown={(e) => e.stopPropagation()}
    >
      <hr />
      <NoteInput
        inputRef={replyTextareaRef}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        placeholder={placeHolderText}
        onBlur={() => setIsFocused(false)}
        onSubmit={postReply}
        shouldLimitHeight={isCommentPopup}
        annotation={annotation}
        currentDocument={currentDocument}
      />
      {isFocused && (
        <div className="buttons btn_mg-0">
          <ButtonMaterial className="secondary" onMouseDown={handleCancelClick}>
            {t('action.cancel')}
          </ButtonMaterial>
          <ButtonMaterial
            className={`primary ${replyBtnClass}`}
            onMouseDown={postReply}
            disabled={!comment.removeHTMLTag(value).trim()}
          >
            {t('action.reply')}
          </ButtonMaterial>
        </div>
      )}
    </div>
  );
};

ReplyArea.propTypes = {
  annotation: PropTypes.object.isRequired,
  handleReplyReopen: PropTypes.func,
  replyTextareaRef: PropTypes.object,
  isResolved: PropTypes.bool.isRequired,
  changeIsReOpenByReply: PropTypes.func,
  isCommentPanel: PropTypes.bool,
  triggerResize: PropTypes.func,
};
ReplyArea.defaultProps = {
  handleReplyReopen: () => {},
  replyTextareaRef: {},
  changeIsReOpenByReply: () => {},
  isCommentPanel: false,
  triggerResize:  () => {},
};
export default ReplyArea;
