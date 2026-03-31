/* eslint-disable jsx-a11y/no-static-element-interactions */
import classNames from 'classnames';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import { calculateNotePosition, getAllPagesHeight } from '@new-ui/components/LuminCommentsPanel/utils';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { isComment, isOpenComment } from 'lumin-components/CommentPanel/helper';
import { CommentStyles, Timing } from 'lumin-components/GeneralLayout/components/LuminCommentsPanel/constant';

import { useWindowSize } from 'hooks';

import { isTabletOrMobile } from 'helpers/device';
import scrollToAnnotation from 'helpers/scrollToAnnotation';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import DataElements from 'constants/dataElement';
import { ANNOTATION_SELECTED_ACTION, AnnotationSubjectMapping } from 'constants/documentConstants';
import { OLD_LAYOUT_COMMENT_PANEL_WIDTH } from 'constants/lumin-common';
import ToolsName from 'constants/toolsName';

import CommentList from './CommentList';
import './CommentPanel.scss';

const CommentPanel = ({ showWarningBanner }) => {
  const [
    isFormBuildPanelOpen,
    isCommentPanelOpen,
    isSearchPanelOpen,
    isRightPanelOpen,
    isShowTopBar,
    isLeftPanelOpen,
    displayMode,
    annotationsLoaded,
    idealPlacement,
    isPageEditMode,
    isShowBannerAds,
    isShowToolbarTablet,
    isCommentPopupOpen,
    isPreviewOriginalVersionMode,
    isContentEditPanelOpen,
  ] = useSelector(
    (state) => [
      selectors.isElementOpen(state, DataElements.FORM_BUILD_PANEL),
      selectors.isElementOpen(state, DataElements.COMMENT_HISTORY_PANEL),
      selectors.isElementOpen(state, DataElements.SEARCH_PANEL),
      selectors.isElementOpen(state, DataElements.RIGHT_PANEL),
      selectors.getIsShowTopBar(state),
      selectors.isElementOpen(state, DataElements.LEFT_PANEL),
      selectors.getDisplayMode(state),
      selectors.getAnnotationsLoaded(state),
      selectors.getIdealPlacement(state),
      selectors.isPageEditMode(state),
      selectors.getIsShowBannerAds(state),
      selectors.getIsShowToolbarTablet(state),
      selectors.isElementOpen(state, DataElements.COMMENT_POPUP),
      selectors.isElementOpen(state, DataElements.CONTENT_EDIT_PANEL),
      selectors.isPreviewOriginalVersionMode(state),
      selectors.isElementOpen(state, DataElements.CONTENT_EDIT_PANEL),
    ],
    shallowEqual
  );
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);

  const dispatch = useDispatch();
  const [right, setRight] = useState(0);
  const [notes, setNotes] = useState([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState({});
  const [selectedAnnotations, setSelectedAnnotations] = useState([]);
  const [selectedComment, setSelectedComment] = useState({});
  const [isFocusInput, setIsFocusInput] = useState(false);

  const windowSize = useWindowSize(Timing.RESIZE_DEBOUNCE_TIME);

  const panelScrollRef = useRef();
  const panelScrollHeightRef = useRef();
  const isHoveringOnPanel = useRef();
  const handlerResizeObserverDebounced = useRef(debounce(resizeObserverHandler, Timing.RESIZE_DEBOUNCE_TIME)).current;
  const setStyleDebounced = useRef(debounce(setStyle, Timing.RESIZE_DEBOUNCE_TIME)).current;

  const isContinuousView = core.getDisplayMode() === core.CoreControls.DisplayModes.Continuous;
  const annotationCreateStickyTool = core.getTool(ToolsName.STICKY);

  const getCommentAnnotations = () => core.getAnnotationsList().filter((annot) => isOpenComment(annot));

  const setNotesLocation = () => {
    const commentAnnotList = getCommentAnnotations();
    const commentLoc = {};
    const totalPages = core.getTotalPages();
    commentAnnotList.forEach((annot) => {
      if (annot.PageNumber <= totalPages) {
        const { top } = calculateNotePosition(annot);
        commentLoc[annot.Id] = { top };
      }
    });
    if (Object.keys(commentLoc).length) {
      dispatch(actions.setCommentBoxPosition(commentLoc));
    }
  };

  const addSelfScrollClass = () => panelScrollRef.current?.classList.add(CommentStyles.ALLOW_SELF_SCROLL_CLASS);
  const removeSelfScrollClass = () => panelScrollRef.current?.classList.remove(CommentStyles.ALLOW_SELF_SCROLL_CLASS);

  const onMouseEnter = () => {
    isHoveringOnPanel.current = true;
    addSelfScrollClass();
  };
  const onMouseLeave = () => {
    isHoveringOnPanel.current = false;
    removeSelfScrollClass();
  };

  const onTransitionEnd = () => {
    setStyle();
  };

  function resizeObserverHandler() {
    setNotesLocation();
  }

  const handleMouseEvent = ({ target }) => {
    if (panelScrollRef.current?.contains(target)) {
      onMouseEnter();
    } else {
      onMouseLeave();
    }
  };

  const setDocumentHeight = () => {
    if (!panelScrollHeightRef.current) {
      return;
    }
    if (Object.keys(idealPlacement).length && isContinuousView && !isPageEditMode) {
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

  const setNotesList = () => {
    const newNotes = getCommentAnnotations();
    setNotes(newNotes);
  };
  const onStickyAnnotationAdded = (annotation) => {
    setIsFocusInput(true);
    dispatch(actions.closeElements([DataElements.RIGHT_PANEL, DataElements.LEFT_PANEL]));
    document.body.style.pointerEvents = 'none';
    if (core.getDisplayMode() !== 'Continuous') {
      core.setDisplayMode('Continuous');
      core.jumpToAnnotation(annotation);
    }
    dispatch(actions.setSelectedComment(annotation.Id));
  };

  const onAnnotationSelected = (_, action) => {
    const isSelectAnnotation = action === ANNOTATION_SELECTED_ACTION.SELECTED;
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
    if (!isSelectAnnotation) {
      dispatch(actions.finishNoteEditing());
    }
    setIsFocusInput(isSelectAnnotation);
    setSelectedNoteIds(ids);

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
    setSelectedAnnotations(annotsSelected);
  };

  const updateScrollViewByPanel = () => {
    const { scrollTop } = panelScrollRef.current;
    if (panelScrollRef.current.classList.contains(CommentStyles.ALLOW_SELF_SCROLL_CLASS)) {
      const documentScroll = core.getScrollViewElement();
      documentScroll.scrollTop = scrollTop;
    }
  };

  const onAnnotationChanged = (annotations) => {
    if (annotations.some((annot) => annot instanceof window.Core.Annotations.StickyAnnotation)) {
      setNotesList();
    }
  };

  const getMarginTop = () =>
    `${
      core.getViewerElement().getBoundingClientRect().top -
      core.getScrollViewElement().getBoundingClientRect().top +
      CommentStyles.PAGE1_MARGIN
    }px`;

  function setStyle() {
    const viewerRect = core.getViewerElement().getBoundingClientRect();
    const scrollViewRect = core.getScrollViewElement().getBoundingClientRect();
    const pageRect = viewerRect.width > scrollViewRect.width ? scrollViewRect : viewerRect;
    const rightSpace = Math.max(window.innerWidth - pageRect.width - pageRect.left - OLD_LAYOUT_COMMENT_PANEL_WIDTH, 0);
    setRight(rightSpace);
    panelScrollRef.current && (panelScrollRef.current.style.paddingTop = getMarginTop());
  }

  const resetScrollTop = () => {
    const { scrollTop } = core.getScrollViewElement();
    if (panelScrollRef.current) {
      panelScrollRef.current.scrollTop = scrollTop;
    }
  };

  const handleOnScroll = () => {
    updateScrollViewByPanel();
  };

  const isHasNotes = panelScrollHeightRef.current?.hasChildNodes();

  useEffect(() => {
    core.addEventListener('annotationChanged', onAnnotationChanged);
    core.getScrollViewElement().addEventListener('transitionend', onTransitionEnd);
    document.addEventListener('mousemove', handleMouseEvent);
    annotationCreateStickyTool.addEventListener('annotationCreated', onStickyAnnotationAdded);
    return () => {
      document.removeEventListener('mousemove', handleMouseEvent);
      core.removeEventListener('annotationChanged', onAnnotationChanged);
      core.getScrollViewElement().removeEventListener('transitionend', onTransitionEnd);
      annotationCreateStickyTool.removeEventListener('annotationCreated', onStickyAnnotationAdded);
    };
  }, []);

  useEffect(() => {
    if (isCommentPanelOpen && isTabletOrMobile()) {
      dispatch(actions.closeElement(DataElements.SEARCH_PANEL));
    }
  }, [dispatch, isCommentPanelOpen]);

  useEffect(() => {
    const onPageComplete = () => {
      setStyle();
      setDocumentHeight();
      setNotesLocation();
      resetScrollTop();
    };
    const onPageCompleteDebounced = debounce(onPageComplete, Timing.PAGE_COMPLETE_DEBOUNCE_TIME);
    core.docViewer.addEventListener('pageComplete', onPageCompleteDebounced);
    core.addEventListener('annotationSelected', onAnnotationSelected);
    return () => {
      onPageCompleteDebounced.cancel();
      core.docViewer.removeEventListener('pageComplete', onPageCompleteDebounced);
      core.removeEventListener('annotationSelected', onAnnotationSelected);
    };
  }, [idealPlacement, isPageEditMode, displayMode]);

  useEffect(() => {
    if (
      !isRightPanelOpen &&
      !isCommentPanelOpen &&
      !isFormBuildPanelOpen &&
      !isPreviewOriginalVersionMode &&
      !isContentEditPanelOpen &&
      isHasNotes
    ) {
      dispatch(actions.openElement(DataElements.COMMENT_HISTORY_PANEL));
    }
    if (!isHasNotes) {
      dispatch(actions.closeElement(DataElements.COMMENT_HISTORY_PANEL));
    }
    if (!isRightPanelOpen && Object.keys(selectedComment).length) {
      dispatch(
        actions.closeElements([DataElements.SEARCH_PANEL, DataElements.SEARCH_OVERLAY, DataElements.LEFT_PANEL])
      );
    }
  }, [
    isRightPanelOpen,
    isCommentPanelOpen,
    selectedComment,
    isFormBuildPanelOpen,
    isHasNotes,
    isContentEditPanelOpen,
    isPreviewOriginalVersionMode,
    isContentEditPanelOpen,
  ]);

  useEffect(() => {
    if (annotationsLoaded) {
      setDocumentHeight();
      setNotesList();
      setStyle();
    }
  }, [annotationsLoaded, windowSize]);

  useEffect(() => {
    if (isPageEditMode) {
      core.getViewerElement().style.minHeight = '';
    } else {
      setDocumentHeight();
    }
  }, [idealPlacement, isPageEditMode]);

  useEffect(() => {
    if (!isContinuousView) {
      core.getViewerElement().style.minHeight = '';
      if (selectedAnnotations.length) {
        core.getAnnotationManager().deselectAnnotations(selectedAnnotations);
        setSelectedNoteIds({});
      }
    }
  }, [displayMode, selectedAnnotations]);

  useEffect(() => {
    if (Object.keys(selectedComment).length) {
      if (isHoveringOnPanel.current) {
        scrollToAnnotation(panelScrollRef.current, selectedComment, 'instant');
      }
      dispatch(actions.setSelectedComment(selectedComment.Id));
    }
  }, [selectedComment]);

  useEffect(() => {
    setStyleDebounced();
    return () => {
      setStyleDebounced.cancel();
    };
  }, [notes]);

  const getClassName = () => {
    const isOpen =
      isCommentPanelOpen &&
      !isPageEditMode &&
      isContinuousView &&
      !isLeftPanelOpen &&
      !isSearchPanelOpen &&
      !isCommentPopupOpen;
    const isClosed = !isOpen;

    return classNames({
      Panel: true,
      CommentPanel: true,
      open: isOpen,
      closed: isClosed,
      'has-warning-banner': showWarningBanner,
      'has-top-bar': isShowTopBar,
      'has-toolbar': isShowToolbarTablet,
      'has-banner': isShowBannerAds,
      'is-in-content-edit-mode': isInContentEditMode,
    });
  };

  return (
    <div className={getClassName()} data-element={DataElements.COMMENT_HISTORY_PANEL} style={{ right }}>
      <div
        onScroll={handleOnScroll}
        onMouseDown={core.deselectAllAnnotations}
        className="Panel"
        id={CommentStyles.PANEL_SCROLL_ID}
        ref={panelScrollRef}
      >
        <div className="normal-notes-container" ref={panelScrollHeightRef}>
          <CommentList
            notes={notes}
            onResize={handlerResizeObserverDebounced}
            selectedNoteIds={selectedNoteIds}
            isFocusInput={isFocusInput}
            setIsFocusInput={setIsFocusInput}
          />
        </div>
      </div>
    </div>
  );
};

CommentPanel.propTypes = {
  showWarningBanner: PropTypes.bool,
};

CommentPanel.defaultProps = {
  showWarningBanner: false,
};

export default CommentPanel;
