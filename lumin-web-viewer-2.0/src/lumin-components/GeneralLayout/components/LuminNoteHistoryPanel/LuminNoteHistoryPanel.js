import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import LuminNoteItemSkeleton from '@new-ui/components/LuminCommentBox/components/LuminNoteItemSkeleton';
import ExportFooter from '@new-ui/components/LuminNoteHistoryPanel/components/ExportFooter';
import useRightPanelAnimationObserver from '@new-ui/hooks/useRightPanelAnimationObserver';

import core from 'core';
import selectors from 'selectors';

import { isComment, isNotReplyComment } from 'lumin-components/CommentPanel/helper';
import { LayoutElements } from 'lumin-components/GeneralLayout/constants';
import NormalList from 'lumin-components/NotesPanel/NormalList';

import fireEvent from 'helpers/fireEvent';
import getCurrentRole from 'helpers/getCurrentRole';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { CUSTOM_EVENT } from 'constants/customEvent';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { DOCUMENT_ROLES } from 'constants/lumin-common';
import { ShowValues, getSortStrategies } from 'constants/sortStrategies';
import ToolsName from 'constants/toolsName';

import EmptyComments from './components/EmptyComments';
import HistoryPanelHeader from './components/HistoryPanelHeader';
import NoteItem from './components/LuminNoteHistoryItem';
import NoteVirtualizedList from './components/NoteVirtualizedList';

import * as Styled from './LuminNoteHistoryPanel.styled';

const VIRTUALIZATION_THRESHOLD = 50;
const SCROLL_DEBOUNCED_TIME = 150;

const LuminNoteHistoryPanel = ({
  currentUser,
  currentDocument,
  isNoteHistoryPanelOpen,
  selectComment,
  isAnnotationLoaded,
  sortStrategy,
  showNoteOption,
  noteEditingAnnotationId,
}) => {
  const currentRole = getCurrentRole(currentDocument);
  const canComment = currentUser && currentRole && currentRole.toUpperCase() !== DOCUMENT_ROLES.SPECTATOR;
  const [selectedNoteIds, setSelectedNoteIds] = useState({});
  const [selectedAnnotations, setSelectedAnnotations] = useState([]);
  const [_selectedComment, setSelectedComment] = useState({});
  const [isEligibleForFocus, setIsEligibleForFocus] = useState(false);
  const isDocViewerLoaded = useSelector(selectors.isDocumentLoaded);
  const [notes, setNotes] = useState([]);

  useRightPanelAnimationObserver(() => {
    setIsEligibleForFocus(isNoteHistoryPanelOpen);
  });

  const listRef = useRef();
  const scrollTopRef = useRef(0);

  const isContinuousView = core.getDisplayMode() === core.CoreControls.DisplayModes.Continuous;
  const annotationCreateStickyTool = core.getTool(ToolsName.STICKY);

  const onAnnotationSelected = () => {
    const ids = {};
    const annotsSelected = core
      .getSelectedAnnotations()
      .filter(
        (annot) =>
          AnnotationSubjectMapping.link !== annot.Subject &&
          !annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key)
      );

    // const annotsSelected = core.getSelectedAnnotations().filter((annot) => !annot.isReply());
    annotsSelected.forEach((annot) => {
      ids[annot.Id] = true;
    });

    const firstAnnot = annotsSelected[0];
    const isFreetextAnnotSelected = firstAnnot?.Subject === AnnotationSubjectMapping.freetext;
    const requireSetSelectedNoteIds = () => {
      if (!isFreetextAnnotSelected) {
        return true;
      }
      return !firstAnnot?.getEditor()?.hasFocus();
    };

    if (requireSetSelectedNoteIds()) {
      setSelectedNoteIds(ids);
    }

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

  const closeCommentHistory = () => {
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.DEFAULT,
      isOpen: false,
    });
  };

  const onStickyAnnotationAdded = (annotation) => {
    closeCommentHistory();

    document.body.style.pointerEvents = 'none';
    if (core.getDisplayMode() !== core.CoreControls.DisplayModes.Continuous) {
      core.setDisplayMode(core.CoreControls.DisplayModes.Continuous);
      core.jumpToAnnotation(annotation);
    }
    selectComment(annotation.Id);
  };

  const getMainNote = useCallback(() => {
    if (!isAnnotationLoaded || !isDocViewerLoaded) {
      return [];
    }
    return core.getAnnotationsList().filter((annot) => {
      const isNotPlaceholder = !annot.isContentEditPlaceholder();

      const isValidNoteSubject = Boolean(
        annot.Subject &&
          ![
            AnnotationSubjectMapping.noName,
            AnnotationSubjectMapping.widget,
            AnnotationSubjectMapping.stickyNote,
            AnnotationSubjectMapping.redact,
          ].includes(annot.Subject)
      );
      const isCommentAnnot = isNotReplyComment(annot) && annot.getContents();

      const isValidNoteTool = Boolean(
        annot.ToolName && ![ToolsName.STICKY, ToolsName.FORM_BUILDER, ToolsName.REDACTION].includes(annot.ToolName)
      );

      const isValidNote = isValidNoteSubject || isValidNoteTool;

      return Boolean(
        isCommentAnnot ||
          (isValidNote &&
            isNotPlaceholder &&
            !annot.isReply() &&
            !annot.Hidden &&
            !annot.isGrouped() &&
            !annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key)) &&
            !(annot instanceof window.Core.Annotations.WidgetAnnotation)
      );
    });
  }, [isAnnotationLoaded, isDocViewerLoaded]);

  useEffect(() => {
    const filteredNotes = getMainNote();
    setNotes(filteredNotes);
  }, [getMainNote]);

  const filterNote = (note) => {
    const isOnlyShowComment = showNoteOption === ShowValues.HIDE_NOTES;
    if (isOnlyShowComment) {
      return isNotReplyComment(note) && note.getContents();
    }

    const isOnlyShowMyNotes = [ShowValues.SHOW_MY_NOTES, ShowValues.EXPORT_MY_NOTES].includes(showNoteOption);
    if (isOnlyShowMyNotes) {
      return !isComment(note) && note.Author === currentUser.email;
    }
    return true;
  };

  const sortedNotes = useMemo(
    () => getSortStrategies()[sortStrategy].getSortedNotes(notes).filter(filterNote),
    [sortStrategy, notes]
  );

  const isVirtualizedList = sortedNotes.length > VIRTUALIZATION_THRESHOLD;

  useEffect(() => {
    const onDocumentUnloaded = () => {
      setSelectedNoteIds({});
    };

    core.addEventListener('documentUnloaded', onDocumentUnloaded);
    annotationCreateStickyTool.addEventListener('annotationCreated', onStickyAnnotationAdded);
    core.addEventListener('annotationSelected', onAnnotationSelected);

    return () => {
      core.removeEventListener('documentUnloaded', onDocumentUnloaded);
      annotationCreateStickyTool.removeEventListener('annotationCreated', onStickyAnnotationAdded);
      core.removeEventListener('annotationSelected', onAnnotationSelected);
    };
  }, []);

  useEffect(() => {
    const handleUpdateNotes = () => {
      setNotes(getMainNote());
    };
    core.addEventListener('annotationChanged', handleUpdateNotes);
    core.addEventListener('annotationHidden', handleUpdateNotes);

    return () => {
      core.removeEventListener('annotationChanged', handleUpdateNotes);
      core.removeEventListener('annotationHidden', handleUpdateNotes);
    };
  }, [getMainNote]);

  useEffect(() => {
    const annotsSelected = core.getSelectedAnnotations();
    const unselectAnnotations = annotsSelected.filter((selectedNote) => !filterNote(selectedNote));
    if (unselectAnnotations.length) {
      core.getAnnotationManager().deselectAnnotations(unselectAnnotations);
    }
  }, [showNoteOption]);

  const setScrollToIndex = useCallback(
    debounce(() => {
      let selectedIndex = -1;
      const ids = Object.keys(selectedNoteIds);

      selectedIndex = sortedNotes.findIndex((note) => note.Id === noteEditingAnnotationId || ids.includes(note.Id));

      if (!ids.length || selectedIndex === -1) {
        return;
      }

      if (listRef.current) {
        listRef.current.scrollToRow(selectedIndex);
      }
    }, SCROLL_DEBOUNCED_TIME),
    [selectedNoteIds, sortedNotes, noteEditingAnnotationId]
  );

  useEffect(() => {
    setScrollToIndex();
    return () => {
      setScrollToIndex.cancel();
    };
  }, [selectedNoteIds, noteEditingAnnotationId]);

  const handleScroll = useCallback((scrollTop) => {
    if (scrollTop) {
      scrollTopRef.current = scrollTop;
    }
  }, []);

  const getSelectedIndex = useCallback(
    (sortedNotes) => {
      if (!sortedNotes.length || !selectedAnnotations.length) {
        return -1;
      }
      return sortedNotes.findIndex((sortedAnnot) => selectedAnnotations.some((annot) => annot.Id === sortedAnnot.Id));
    },
    [selectedAnnotations]
  );

  const renderComments = () => {
    if (!notes.length) {
      // render skeleton while await comments loading
      if (!isDocViewerLoaded) {
        return <LuminNoteItemSkeleton count={4} />;
      }
      return <EmptyComments showNoteOption={showNoteOption} canComment={canComment} />;
    }

    const renderNoteItem = ({ notes: sortedNotes, index }) => {
      const currentNode = sortedNotes[index];
      return (
        <NoteItem
          key={currentNode.Id}
          selectedNoteIds={selectedNoteIds}
          currentNote={currentNode}
          index={index}
          sortedNotes={sortedNotes}
          isEligibleForFocus={isEligibleForFocus}
        />
      );
    };

    const selectedIndex = getSelectedIndex(sortedNotes);

    if (isVirtualizedList) {
      return (
        <NoteVirtualizedList
          ref={listRef}
          notes={sortedNotes}
          sortStrategy={sortStrategy}
          onScroll={handleScroll}
          initialScrollTop={scrollTopRef.current}
          selectedIndex={selectedIndex}
        >
          {renderNoteItem}
        </NoteVirtualizedList>
      );
    }

    return (
      <NormalList ref={listRef} notes={sortedNotes} onScroll={handleScroll} initialScrollTop={scrollTopRef.current}>
        {renderNoteItem}
      </NormalList>
    );
  };

  if (!isNoteHistoryPanelOpen) {
    return null;
  }

  return (
    <Styled.CommentHistoryContainer>
      <HistoryPanelHeader notes={sortedNotes} />
      <Styled.CommentHistoryWrapper
        className="custom-scrollbar-reskin"
        isShowExportFooter={showNoteOption === ShowValues.EXPORT_MY_NOTES}
        onMouseDown={core.deselectAllAnnotations}
      >
        {renderComments()}
      </Styled.CommentHistoryWrapper>
      {Boolean(sortedNotes.length && currentUser) && (
        <ExportFooter sortedNotes={sortedNotes} selectedNoteKeys={Object.keys(selectedNoteIds)} />
      )}
    </Styled.CommentHistoryContainer>
  );
};

LuminNoteHistoryPanel.propTypes = {
  currentDocument: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  isNoteHistoryPanelOpen: PropTypes.bool.isRequired,
  selectComment: PropTypes.func.isRequired,
  isAnnotationLoaded: PropTypes.bool,
  sortStrategy: PropTypes.string.isRequired,
  showNoteOption: PropTypes.string.isRequired,
  noteEditingAnnotationId: PropTypes.string,
};

LuminNoteHistoryPanel.defaultProps = {
  currentUser: null,
  isAnnotationLoaded: false,
  noteEditingAnnotationId: '',
};

export default LuminNoteHistoryPanel;
