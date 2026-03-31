import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, useCallback } from 'react';

import core from 'core';

import { isComment, isOpenComment } from 'lumin-components/CommentPanel/helper';
import { LayoutElements } from 'lumin-components/GeneralLayout/constants';

import { useWindowSize } from 'hooks';

import fireEvent from 'helpers/fireEvent';
import scrollToAnnotation from 'helpers/scrollToAnnotation';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { CUSTOM_EVENT } from 'constants/customEvent';
import DataElements from 'constants/dataElement';
import { COMMENT_PANEL_LAYOUT_STATE, AnnotationSubjectMapping } from 'constants/documentConstants';
import { RIGHT_COMMENT_SPACING } from 'constants/lumin-common';
import ToolsName from 'constants/toolsName';

import { CommentStyles, MAX_PAGE_SHOW_COMMENT_PANEL, Timing } from './constant';
import LuminCommentItem from './LuminCommentItem';
import { calculateNotePosition, getAllPagesHeight } from './utils';

import * as Styled from './LuminCommentsPanel.styled';

const LuminCommentsPanel = ({
  isCommentPanelOpen,
  isDocumentLoaded,
  isRightPanelOpen,
  displayMode,
  idealPlacement,
  isPageEditMode,
  setCommentLocations,
  selectComment,
  commentLayout,
  documentContainerRef,
  isLeftPanelOpen,
  totalPages,
  isInPresenterMode,
}) => {
  const [left, setLeftSpacing] = useState(0);
  const [top, setTop] = useState(0);

  const [comments, setCommentList] = useState([]);
  const [selectedCommentIds, setSelectedCommentsIds] = useState({});
  const [selectedComments, setSelectedComments] = useState([]);
  const [selectedComment, setSelectedComment] = useState({});
  const windowSize = useWindowSize(Timing.RESIZE_DEBOUNCE_TIME);
  const panelScrollRef = useRef();
  const panelScrollHeightRef = useRef();
  const isHoveringOnPanel = useRef();
  const updateStyleDebounced = useCallback(debounce(setStyle, Timing.RESIZE_DEBOUNCE_TIME), []);

  const isContinuousView = core.getDisplayMode() === core.CoreControls.DisplayModes.Continuous;
  const annotationCreateStickyTool = core.getTool(ToolsName.STICKY);

  const getCommentAnnotations = () => core.getAnnotationsList().filter((annot) => isOpenComment(annot));

  const syncCommentPanelScrollPosition = () => {
    if (panelScrollHeightRef.current) {
      const { scrollTop } = core.getScrollViewElement();
      panelScrollHeightRef.current.offsetParent.scrollTop = scrollTop;
    }
  };

  const setCommentListLocation = () => {
    const commentAnnotList = getCommentAnnotations();
    const commentLocations = {};
    commentAnnotList.forEach((annot) => {
      if (annot.PageNumber <= totalPages) {
        const { top } = calculateNotePosition(annot);
        commentLocations[annot.Id] = { top };
      }
    });
    if (Object.keys(commentLocations).length) {
      setCommentLocations(commentLocations);
    }
    syncCommentPanelScrollPosition();
  };

  const setCommentListLocationDebounced = useCallback(debounce(setCommentListLocation, Timing.RESIZE_DEBOUNCE_TIME), [
    totalPages,
  ]);

  const addScrollClass = () => panelScrollRef.current.classList.add(CommentStyles.ALLOW_SELF_SCROLL_CLASS);
  const removeScrollClass = () => panelScrollRef.current.classList.remove(CommentStyles.ALLOW_SELF_SCROLL_CLASS);

  const onMouseEnter = () => {
    isHoveringOnPanel.current = true;
    addScrollClass();
  };
  const onMouseLeave = () => {
    isHoveringOnPanel.current = false;
    removeScrollClass();
  };

  const onTransitionEnd = () => {
    updateStyleDebounced();
  };

  const handleMouseEvent = ({ target }) => {
    if (panelScrollRef.current.contains(target)) {
      onMouseEnter();
    } else {
      onMouseLeave();
    }
  };

  const setDocumentHeight = () => {
    if (!panelScrollHeightRef.current) {
      return;
    }
    if (Object.keys(idealPlacement).length) {
      const totalDocumentHeight = getAllPagesHeight();
      const PADDING = 10;
      const commentBoxAtBottom = {
        top: 0,
        height: 0,
      };
      Object.entries(idealPlacement).forEach((commentBox) => {
        if (commentBoxAtBottom.top < commentBox[1].top) {
          commentBoxAtBottom.top = commentBox[1].top;
          commentBoxAtBottom.height = commentBox[1].height;
        }
      });
      const commentBoxTotalHeight = commentBoxAtBottom.top + commentBoxAtBottom.height + PADDING;

      core.getViewerElement().style.minHeight =
        commentBoxTotalHeight > totalDocumentHeight ? `${commentBoxTotalHeight}px` : '';

      panelScrollHeightRef.current.style.minHeight =
        commentBoxTotalHeight > totalDocumentHeight ? `${commentBoxTotalHeight}px` : `${totalDocumentHeight}px`;
    } else {
      panelScrollHeightRef.current.style.minHeight = `${core.getViewerElement().offsetHeight}px`;
    }
  };

  const setComments = useCallback(
    debounce(() => {
      const newNotes = getCommentAnnotations();
      setCommentList(newNotes);
    }, Timing.SET_COMMENTS),
    []
  );

  const onStickyAnnotationCreated = (annotation) => {
    document.body.style.pointerEvents = 'none';
    if (core.getDisplayMode() !== core.CoreControls.DisplayModes.Continuous) {
      core.setDisplayMode(core.CoreControls.DisplayModes.Continuous);
      core.jumpToAnnotation(annotation);
    }
    selectComment(annotation.Id);
  };

  const onAnnotationSelected = () => {
    if (isInPresenterMode) {
      return;
    }

    const ids = {};
    const annotsSelected = core
      .getSelectedAnnotations()
      .filter(
        (annot) =>
          (isComment(annot) || annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key)) &&
          !annot.isReply()
      );

    annotsSelected.forEach((annot) => {
      ids[annot.Id] = true;
    });
    setSelectedCommentsIds(ids);

    let annotation = {};
    const annotsSelectedCommentOnly = annotsSelected.filter(isComment);
    if (annotsSelectedCommentOnly.length > 0) {
      [annotation] = annotsSelectedCommentOnly;
      if (!isContinuousView) {
        core.setDisplayMode(core.CoreControls.DisplayModes.Continuous);
      }
    }
    if (annotsSelected.length === 2) {
      if (annotsSelected[0].Subject === AnnotationSubjectMapping.highlight && isComment(annotsSelected[1])) {
        [, annotation] = annotsSelected;
      }
      if (isComment(annotsSelected[0]) && annotsSelected[1].Subject === AnnotationSubjectMapping.highlight) {
        [annotation] = annotsSelected;
      }
    }
    setSelectedComment(annotation);
    setSelectedComments(annotsSelected);
  };

  function onAnnotationChanged(annotations) {
    if (annotations.some((annot) => annot instanceof window.Core.Annotations.StickyAnnotation)) {
      setComments();
    }
  }

  function setStyle() {
    const { right } = core.getViewerElement().getBoundingClientRect();

    if (documentContainerRef) {
      const { top } = documentContainerRef.getBoundingClientRect();
      const { top: appContainerTop } = document.getElementById('app-container').getBoundingClientRect();
      setTop(top - appContainerTop);
    }
    const leftSpacing = Math.max(right + RIGHT_COMMENT_SPACING, 0);
    setLeftSpacing(leftSpacing);
  }

  const handleOnScroll = () => {
    if (panelScrollRef.current.classList.contains(CommentStyles.ALLOW_SELF_SCROLL_CLASS)) {
      const { scrollTop } = panelScrollRef.current;
      const documentScroll = core.getScrollViewElement();
      documentScroll.scrollTop = scrollTop;
    }
  };

  useEffect(() => {
    if (isDocumentLoaded) {
      core.addEventListener('annotationChanged', onAnnotationChanged);
    }
    return () => {
      if (isDocumentLoaded) {
        core.removeEventListener('annotationChanged', onAnnotationChanged);
      }
    };
  }, [isDocumentLoaded]);

  useEffect(() => {
    core.getScrollViewElement().addEventListener('transitionend', onTransitionEnd);
    document.addEventListener('mousemove', handleMouseEvent);
    annotationCreateStickyTool.addEventListener('annotationCreated', onStickyAnnotationCreated);
    return () => {
      document.removeEventListener('mousemove', handleMouseEvent);
      core.getScrollViewElement().removeEventListener('transitionend', onTransitionEnd);
      annotationCreateStickyTool.removeEventListener('annotationCreated', onStickyAnnotationCreated);
      setComments.cancel();
    };
  }, []);

  const onPageComplete = () => {
    if (!core.getDocument()) {
      return;
    }
    setCommentListLocation();
    setDocumentHeight();
    syncCommentPanelScrollPosition();
    setStyle();
  };

  const onPageCompleteDebounced = useCallback(debounce(onPageComplete, Timing.PAGE_COMPLETE_DEBOUNCE_TIME), []);

  useEffect(() => {
    core.docViewer.addEventListener('pageComplete', onPageCompleteDebounced);
    core.addEventListener('annotationSelected', onAnnotationSelected);

    return () => {
      onPageCompleteDebounced.cancel();
      core.docViewer.removeEventListener('pageComplete', onPageCompleteDebounced);
      core.removeEventListener('annotationSelected', onAnnotationSelected);
    };
  }, [idealPlacement, isPageEditMode, displayMode]);

  useEffect(() => {
    if (isDocumentLoaded && !isRightPanelOpen) {
      setDocumentHeight();
      setComments();
      setStyle();
    }
  }, [isDocumentLoaded, windowSize, isRightPanelOpen]);

  useEffect(() => {
    if (isPageEditMode) {
      core.getViewerElement().style.minHeight = '';
    } else {
      setDocumentHeight();
    }
  }, [idealPlacement, isPageEditMode]);

  useEffect(() => {
    if (!isContinuousView && isCommentPanelOpen && selectedComments.length) {
      core.getViewerElement().style.minHeight = '';
      core.getAnnotationManager().deselectAnnotations(selectedComments);
      setSelectedCommentsIds({});
    }
  }, [displayMode, selectedComments, isCommentPanelOpen]);

  useEffect(() => {
    if (Object.keys(selectedComment).length) {
      if (isHoveringOnPanel.current) {
        scrollToAnnotation(panelScrollRef.current, selectedComment, 'instant');
      }
      selectComment(selectedComment.Id);
    }
  }, [selectedComment]);

  useEffect(() => {
    updateStyleDebounced();
    return () => {
      updateStyleDebounced.cancel();
    };
  }, [comments, isLeftPanelOpen]);

  useEffect(() => {
    const isDisplayPanel =
      commentLayout !== COMMENT_PANEL_LAYOUT_STATE.ON_DOCUMENT &&
      displayMode === core.CoreControls.DisplayModes.Continuous &&
      !isRightPanelOpen;

    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.COMMENT_PANEL,
      isOpen: isDisplayPanel,
    });
  }, [isCommentPanelOpen, commentLayout, displayMode, isRightPanelOpen]);

  const renderComments = () => {
    if (!comments.length) {
      return null;
    }
    return comments.map((comment) => (
      <LuminCommentItem
        key={comment.Id}
        selectedCommentIds={selectedCommentIds}
        annotation={comment}
        onResize={setCommentListLocationDebounced}
      />
    ));
  };

  return (
    <Styled.LuminCommentsPanel
      $show={isCommentPanelOpen && !!comments.length && totalPages < MAX_PAGE_SHOW_COMMENT_PANEL}
      style={{
        left,
        top: `${top}px`,
      }}
      data-element={DataElements.COMMENT_HISTORY_PANEL}
    >
      <Styled.LuminCommentsPanelContent
        role="presentation"
        onScroll={handleOnScroll}
        onMouseDown={core.deselectAllAnnotations}
        id={CommentStyles.PANEL_SCROLL_ID}
        ref={panelScrollRef}
      >
        <Styled.CommentList ref={panelScrollHeightRef}>{renderComments()}</Styled.CommentList>
      </Styled.LuminCommentsPanelContent>
    </Styled.LuminCommentsPanel>
  );
};

LuminCommentsPanel.propTypes = {
  isCommentPanelOpen: PropTypes.bool,
  isDocumentLoaded: PropTypes.bool,
  isRightPanelOpen: PropTypes.bool,
  isLeftPanelOpen: PropTypes.bool,
  displayMode: PropTypes.string.isRequired,
  idealPlacement: PropTypes.object,
  isPageEditMode: PropTypes.bool,
  setCommentLocations: PropTypes.func.isRequired,
  selectComment: PropTypes.func.isRequired,
  commentLayout: PropTypes.string.isRequired,
  documentContainerRef: PropTypes.object,
  totalPages: PropTypes.number,
  isInPresenterMode: PropTypes.bool,
};

LuminCommentsPanel.defaultProps = {
  isCommentPanelOpen: true,
  isDocumentLoaded: false,
  isRightPanelOpen: false,
  isLeftPanelOpen: false,
  idealPlacement: null,
  isPageEditMode: false,
  documentContainerRef: null,
  totalPages: 0,
  isInPresenterMode: false,
};

export default LuminCommentsPanel;
