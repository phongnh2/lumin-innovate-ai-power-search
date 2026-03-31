import PropTypes from 'prop-types';
import rafSchd from 'raf-schd';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';
import { useSelector } from 'react-redux';

import { MAX_PAGE_SHOW_COMMENT_PANEL } from '@new-ui/components/LuminCommentsPanel/constant';

import core from 'core';
import selectors from 'selectors';

import { isComment } from 'lumin-components/CommentPanel/helper';

import { getAnnotationPopupPositionBasedOn } from 'helpers/getPopupPosition';

import CommentState from 'constants/commentState';
import { DRAGGABLE_COMMENT_CLASSNAME } from 'constants/commonConstant';
import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import {
  COMMENT_PANEL_LAYOUT_STATE,
  AnnotationSubjectMapping,
  ANNOTATION_ACTION,
  ANNOTATION_SELECTED_ACTION,
} from 'constants/documentConstants';

import LuminCommentBox from '../LuminCommentBox';

import { CommentPopupWrapper } from './LuminCommentPopUp.styled';

const LuminCommentPopup = ({
  isRightPanelOpen = false,
  isPopupOpen = true,
  isPageEditMode = false,
  isPreviewOriginalVersionMode = false,
  closePopup = () => {},
  openPopup = () => {},
  commentLayout,
  isInContentEditMode = false,
  isFormBuildPanelOpen = false,
  noteEditingAnnotationId,
  setNoteEditingAnnotationId,
}) => {
  const isCommentPanelOpen = useSelector(selectors.isCommentPanelOpen);
  const isChatbotPanelOpen = useSelector(selectors.isChatbotPanelOpen);
  const isSearchPanelOpen = useSelector(selectors.isSearchPanelOpen);
  const isInPresenterMode = useSelector(selectors.isInPresenterMode);
  const totalPages = useSelector(selectors.getTotalPages);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  // first annotation in the array when there're multiple annotations selected
  const [selectedComment, setSelectedComment] = useState(null);
  const isCommentPopupOpenRef = useRef(true);
  const popupRef = useRef();
  const highlightAnnotRef = useRef();

  const closeCommentPopup = useCallback(() => {
    setPosition({ left: 0, top: 0 });
    setSelectedComment(null);
    highlightAnnotRef.current = null;
    setNoteEditingAnnotationId('');
  }, []);

  useEffect(() => {
    isCommentPopupOpenRef.current = isPopupOpen;
  }, [isPopupOpen]);

  useEffect(() => {
    const { left, top } = position;
    if (popupRef.current && left !== 0 && top !== 0) {
      popupRef.current.style.opacity = 1;
    }
  }, [position]);

  useEffect(() => {
    if (isPopupOpen && commentLayout !== COMMENT_PANEL_LAYOUT_STATE.ON_DOCUMENT) {
      closePopup();
      return;
    }

    if (!isPopupOpen && commentLayout === COMMENT_PANEL_LAYOUT_STATE.ON_DOCUMENT) {
      openPopup();
    }
  }, [commentLayout, isPopupOpen]);

  const calculatePopupPosition = useCallback(() => {
    if (!popupRef.current || !selectedComment) {
      return;
    }

    let annotToCalcPosition = selectedComment;
    if (
      highlightAnnotRef.current &&
      highlightAnnotRef.current.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key) === selectedComment.Id
    ) {
      annotToCalcPosition = highlightAnnotRef.current;
    }

    const { left, top } = getAnnotationPopupPositionBasedOn(annotToCalcPosition, popupRef);
    setPosition({ left, top });
  }, [selectedComment]);

  useEffect(() => {
    if (!popupRef.current) {
      return;
    }

    const observer = new ResizeObserver(calculatePopupPosition);
    observer.observe(popupRef.current);

    return () => {
      observer.disconnect();
    };
  }, [calculatePopupPosition]);

  useEffect(() => {
    if (selectedComment) {
      calculatePopupPosition();
    }

    const onMouseLeftUp = (e) => {
      // clicking on the selected annotation is considered clicking outside of this component
      // so this component will close due to useOnClickOutside
      // this handler is used to make sure that if we click on the selected annotation, this component will show up again
      if (selectedComment) {
        const annotUnderMouse = core.getAnnotationByMouseEvent(e);
        if (annotUnderMouse === selectedComment && selectedComment.Subject === AnnotationSubjectMapping.stickyNote) {
          calculatePopupPosition();
        }
      }
    };

    const onAnnotationChanged = (annotations, action) => {
      if (action === ANNOTATION_ACTION.MODIFY && annotations.length > 0) {
        calculatePopupPosition();
      }
      if (action === ANNOTATION_ACTION.DELETE && annotations.some((annot) => annot.Id === selectedComment?.Id)) {
        closeCommentPopup();
      }
    };

    const setPositionDebounce = rafSchd(calculatePopupPosition);
    core.addEventListener('mouseLeftUp', onMouseLeftUp);
    core.docViewer.getScrollViewElement().addEventListener('scroll', setPositionDebounce);
    core.addEventListener('annotationChanged', onAnnotationChanged);
    return () => {
      core.docViewer.getScrollViewElement().removeEventListener('scroll', setPositionDebounce);
      core.removeEventListener('mouseLeftUp', onMouseLeftUp);
      core.removeEventListener('annotationChanged', onAnnotationChanged);
    };
  }, [selectedComment, isRightPanelOpen, isCommentPanelOpen]);

  useEffect(() => {
    const onAnnotationSelected = (annotations, action) => {
      const annotManager = core.getAnnotationManager();
      const isSelectedReply = annotations?.length && annotations[0].isReply();

      if (isSelectedReply || !isCommentPopupOpenRef.current) {
        return;
      }
      const stickAnnot = annotations.find(
        (annotation) => isComment(annotation) && annotation.getState() !== CommentState.Resolved.state
      );

      const highlightCommentAnnot = annotations.find(
        (annot) =>
          annot.Subject === AnnotationSubjectMapping.highlight &&
          annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key)
      );

      if (action === ANNOTATION_SELECTED_ACTION.SELECTED) {
        if (highlightCommentAnnot) {
          highlightAnnotRef.current = highlightCommentAnnot;
          const commentAnnotId = highlightCommentAnnot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key);
          const commentAnnot = annotManager.getAnnotationById(commentAnnotId);
          if (commentAnnot) {
            annotManager.selectAnnotation(commentAnnot);
          }

          return;
        }
        const hasOneCommentAnnot = annotations.length === 1 && stickAnnot;
        if (!hasOneCommentAnnot) {
          closeCommentPopup();
          return;
        }
        setSelectedComment(stickAnnot);
      } else {
        closeCommentPopup();
      }
    };

    core.addEventListener('annotationSelected', onAnnotationSelected);
    core.addEventListener('documentUnloaded', closeCommentPopup);
    return () => {
      core.removeEventListener('annotationSelected', onAnnotationSelected);
      core.removeEventListener('documentUnloaded', closeCommentPopup);
    };
  }, []);

  useEffect(() => {
    const selectedAnnotation = core.getAnnotationManager().getAnnotationById(noteEditingAnnotationId);
    if (selectedAnnotation) {
      setSelectedComment(selectedAnnotation);
    }
  }, [noteEditingAnnotationId]);

  const shouldHidePopup =
    !selectedComment ||
    isPageEditMode ||
    isPreviewOriginalVersionMode ||
    !isPopupOpen ||
    (isRightPanelOpen && !isChatbotPanelOpen && !isSearchPanelOpen) ||
    isInContentEditMode ||
    isFormBuildPanelOpen ||
    isInPresenterMode ||
    (commentLayout !== COMMENT_PANEL_LAYOUT_STATE.ON_DOCUMENT && totalPages < MAX_PAGE_SHOW_COMMENT_PANEL);

  if (shouldHidePopup) {
    return null;
  }

  return (
    <Draggable handle={`.${DRAGGABLE_COMMENT_CLASSNAME}`}>
      <CommentPopupWrapper ref={popupRef} data-element="commentPopup" style={{ ...position }}>
        <LuminCommentBox
          annotation={selectedComment}
          isCommentPopup
          isSelected
          closeCommentPopup={closeCommentPopup}
          isContentEditable={selectedComment && core.canModify(selectedComment)}
        />
      </CommentPopupWrapper>
    </Draggable>
  );
};

LuminCommentPopup.propTypes = {
  isRightPanelOpen: PropTypes.bool,
  isPopupOpen: PropTypes.bool,
  isPageEditMode: PropTypes.bool,
  isPreviewOriginalVersionMode: PropTypes.bool,
  closePopup: PropTypes.func,
  openPopup: PropTypes.func,
  commentLayout: PropTypes.string.isRequired,
  isInContentEditMode: PropTypes.bool,
  isFormBuildPanelOpen: PropTypes.bool,
  noteEditingAnnotationId: PropTypes.string.isRequired,
  setNoteEditingAnnotationId: PropTypes.func.isRequired,
};

export default LuminCommentPopup;
