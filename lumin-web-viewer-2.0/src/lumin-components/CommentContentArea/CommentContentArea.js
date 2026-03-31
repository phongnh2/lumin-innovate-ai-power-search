import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';

import core from 'core';

import { isComment } from 'lumin-components/CommentPanel/helper';
import NoteInput from 'lumin-components/NoteInput';
import ButtonMaterial from 'lumin-components/ViewerCommon/ButtonMaterial';

import { commandHandler } from 'HOC/OfflineStorageHOC';

import { useTranslation } from 'hooks';

import exportAnnotationCommand from 'helpers/exportAnnotationCommand';

import { comment, socketUtil } from 'utils';

import { CUSTOM_DATA_COMMENT, CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { AnnotationSubjectMapping, ANNOTATION_ACTION } from 'constants/documentConstants';

const DATA_CANCEL_BUTTON_IDENTITY='comment-content-cancel-button';

CommentContentArea.propTypes = {
  annotation: PropTypes.object.isRequired,
  setIsEditing: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  currentDocument: PropTypes.object,
  setContent: PropTypes.func,
  setIsFocusInput: PropTypes.func,
  editingContent: PropTypes.string.isRequired,
  setEditingContent: PropTypes.func.isRequired,
  isCommentPopup: PropTypes.bool.isRequired,
  closeCommentPopup: PropTypes.func.isRequired,
  isOffline:PropTypes.bool,
};

CommentContentArea.defaultProps = {
  currentUser: {},
  currentDocument: {},
  setContent: () => {},
  setIsFocusInput: () => {},
  isOffline: false,
};

// a component that contains the content richtext input, the save button and the cancel button
export default function CommentContentArea({
  annotation,
  setIsEditing,
  currentUser,
  currentDocument,
  setContent,
  setIsFocusInput,
  editingContent,
  setEditingContent,
  isCommentPopup,
  closeCommentPopup,
  isOffline
}) {
  const mentionContent = annotation.getCustomData(CUSTOM_DATA_COMMENT.MENTION.key);
  const styledComment = annotation.getCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key) || annotation.getContents();

  const contents = mentionContent ? JSON.parse(mentionContent)?.contents : styledComment;

  const defaultCommentValue = contents || editingContent;
  const [value, setValue] = useState(defaultCommentValue);

  const { t } = useTranslation();
  const textareaRef = useRef();
  const isHighlightNote = annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key);
  const isCommentAnnotation = annotation instanceof window.Core.Annotations.StickyAnnotation;

  const commentAdded = useRef(false);

  const findHighlightCommandAndOverride = (annot) => {
    commandHandler.findCommandAndOverride({
      documentId: currentDocument._id,
      annotationId: annot.Id,
      overrideObj: {
        annotationType: AnnotationSubjectMapping.removal,
        annotationAction: ANNOTATION_ACTION.DELETE,
        xfdf: exportAnnotationCommand(annot, ANNOTATION_ACTION.DELETE)
      }
    });
  };

  const deleteEmptyAnnot = () => {
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
      isOffline && findHighlightCommandAndOverride(highlightToDelete);
    }
    core.deleteAnnotations([annotation]);
  };

  const interceptorAnnotation = (annotationData) => ({
    ownerEmail: annotationData.Author,
    ownerComment: annotationData.getContents(),
    comments: annotationData.getReplies().map((item) => ({
      email: item.Author,
      content: item.getContents(),
    })),
  });

  const setContents = async (e) => {
    const editingContentWithoutStyle = comment.removeHTMLTag(value).trim();
    const defaultContentWithoutStyle = comment.removeHTMLTag(comment.redoMarkupSymbol(contents)).trim();
    const hasEdited = editingContentWithoutStyle && editingContentWithoutStyle !== defaultContentWithoutStyle;

    // prevent the textarea from blurring out which will unmount these two buttons
    e.preventDefault();
    if (!value || !contents || value.trim() !== contents.trim()) {
      const removedMarkupSymbol = comment.clearAllMarkupSymbol(value.trim());
      setContent(removedMarkupSymbol);
      annotation.setCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key, value);

      const commentStatusKey = CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.key;
      const isAddedCommentContent = !defaultContentWithoutStyle && editingContentWithoutStyle;
      const commentStatusValue = isAddedCommentContent
        ? CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.added
        : CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.edited;
      annotation.setCustomData(commentStatusKey, commentStatusValue);

      core.setNoteContents(annotation, editingContentWithoutStyle);

      if (annotation instanceof window.Core.Annotations.FreeTextAnnotation) {
        core.drawAnnotationsFromList([annotation]);
      }
    }

    // if user only changes the style, we should not send notification
    if (hasEdited) {
      setIsEditing(false);
      setIsFocusInput(false);
      const commentContent = value.trim();
      const emailsFromContent = comment.getEmailsFromContent(currentUser, editingContentWithoutStyle);

      if (editingContentWithoutStyle) {
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
            socketUtil.socketEmitSendEmailComment(commenter, _id, new Date(), commentContent);
          }

          if (emailsFromContent.length) {
            const annotationData = interceptorAnnotation(annotation);
            socketUtil.socketEmitSendEmailMention(commenter, _id, commentContent, annotationData, emailsFromContent);
          }
        } else {
          socketUtil.socketEmitSendEmailComment({ name: 'Anonymous' }, _id, new Date(), commentContent);
        }
      }
    }
  };

  const closeEditing = () => {
    setIsEditing(false);
    setIsFocusInput(false);
  };

  const onPostContent = (e, needToDeselect = true) => {
    e.preventDefault();
    e.stopPropagation();

    if (isHighlightNote) {
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

    if (comment.removeHTMLTag(value.trim())) {
      setContents(e);
      setIsEditing(false);
      setIsFocusInput(false);
    }
    if (needToDeselect && !contents && !isCommentPopup) {
      core.deselectAnnotation(annotation);
    }
    if (textareaRef.current) {
      const editor = textareaRef.current.getEditor();
      editor.deleteText(0, editor.getLength());
    }
  };

  const onCancel = () => {
    setIsEditing(false);
    setIsFocusInput(false);

    if (!contents && isComment(annotation)) {
      const deleteAnnotations = [annotation];
      if (isHighlightNote) {
        const highlightAnnotations = core
          .getSelectedAnnotations()
          .filter(
            (annot) =>
              annot.Subject === AnnotationSubjectMapping.highlight &&
              annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key) &&
              annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key) === annotation.Id
          );
        deleteAnnotations.push(...highlightAnnotations);
        if (isOffline) {
          highlightAnnotations.forEach((annot) => {
            findHighlightCommandAndOverride(annot);
          });
        }
      }
      core.deleteAnnotations(deleteAnnotations, {});
    }
  };

  const _onChange = (content) => {
    setValue(content);
    setEditingContent(content);
  };

  const onAnnotationSelected = (annotations, action) => {
    if (action === ANNOTATION_ACTION.DESELECTED && !commentAdded.current && isComment(annotation)) {
      if (!annotation.getContents()) {
        const isCancelButton = window.event.target.dataset.identity === DATA_CANCEL_BUTTON_IDENTITY;
        if (comment.removeHTMLTag(value).trim() && !isCancelButton) {
          onPostContent(window.event, false);
        } else {
          deleteEmptyAnnot();
        }
      }
      if (isCommentPopup) {
        closeCommentPopup();
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const textLength = textareaRef.current.getEditor().getLength();
      textareaRef.current.getEditor().setSelection(textLength, textLength);
    }
  }, []);

  useEffect(() => {
    core.addEventListener('annotationSelected', onAnnotationSelected);
    return () => {
      core.removeEventListener('annotationSelected', onAnnotationSelected);
    };
  }, [value]);

  return (
    <div className="edit-content">
      <NoteInput
        annotation={annotation}
        inputRef={textareaRef}
        value={value}
        onChange={_onChange}
        closeEditing={closeEditing}
        placeholder={t('action.commentAndMention')}
        onSubmit={setContents}
        shouldLimitHeight={isCommentPopup}
        currentDocument={currentDocument}
      />
      <span className="buttons">
      <ButtonMaterial className="secondary" onMouseDown={onCancel} data-identity={DATA_CANCEL_BUTTON_IDENTITY}>
          {/* NOTE: dummy label */}
          <span data-identity={DATA_CANCEL_BUTTON_IDENTITY} style={{ width: '100%' }}>
            {t('action.cancel')}
          </span>
        </ButtonMaterial>
        <ButtonMaterial
            className={classNames('primary', {
              disabled: !(value && value.trim()),
            })}
            disabled={!comment.removeHTMLTag(value).trim()}
            onMouseDown={onPostContent}
        >
          {t(!contents && isCommentAnnotation ? 'action.comment' : 'action.save')}
        </ButtonMaterial>
      </span>
    </div>
  );
}
