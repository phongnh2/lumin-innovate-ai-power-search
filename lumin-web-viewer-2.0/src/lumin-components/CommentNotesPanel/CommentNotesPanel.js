/* eslint-disable sonarjs/cognitive-complexity */
import { withApollo } from '@apollo/client/react/hoc';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, shallowEqual, useDispatch, connect } from 'react-redux';
import { compose } from 'redux';
import { ThemeProvider } from 'styled-components';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { isNotReplyComment } from 'lumin-components/CommentPanel/helper';
import Icomoon from 'lumin-components/Icomoon';
import ListSeparator from 'lumin-components/ListSeparator';
import NoteLumin from 'lumin-components/NoteLumin';
import NoteContext from 'lumin-components/NoteLumin/Context';
import NormalList from 'lumin-components/NotesPanel/NormalList';
import VirtualizedList from 'lumin-components/NotesPanel/VirtualizedList';
import SvgElement from 'lumin-components/SvgElement';
import Tooltip from 'lumin-components/Tooltip';
import ButtonMaterial from 'lumin-components/ViewerCommon/ButtonMaterial';

import { useTranslation } from 'hooks';

import getCurrentRole from 'helpers/getCurrentRole';
import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { updateAnnotationAvatarSource } from 'features/Annotation/utils/updateAnnotationAvatarSource';

import { DOCUMENT_ROLES } from 'constants/lumin-common';
import { getSortStrategies } from 'constants/sortStrategies';
import { Colors } from 'constants/styles';

import * as Styled from '../NotesPanel/NotesPanel.styled';

import '../NotesPanel/NotesPanelLumin.scss';
import '../ButtonEditMode/ButtonEditMode.scss';

const CommentNotesPanel = ({ display, currentUser, currentDocument }) => {
  const [sortStrategy, isDisabled, pageLabels, themeMode, currentPage] = useSelector(
    (state) => [
      selectors.getSortStrategy(state),
      selectors.isElementDisabled(state, 'notesPanel'),
      selectors.getPageLabels(state),
      selectors.getThemeMode(state),
      selectors.getCurrentPage(state),
    ],
    shallowEqual
  );
  const { t } = useTranslation();

  const currentRole = getCurrentRole(currentDocument);
  const canComment = currentUser && currentRole && currentRole.toUpperCase() !== DOCUMENT_ROLES.SPECTATOR;

  const [notes, setNotes] = useState([]);
  // the object will be in a shape of { [note.Id]: true }
  // use a map here instead of an array to achieve an O(1) time complexity for checking if a note is selected
  const [selectedNoteIds, setSelectedNoteIds] = useState({});
  const [searchInput, setSearchInput] = useState('');
  const [isFocusInput, setIsFocusInput] = useState(false);
  const listRef = useRef();
  const panelRef = useRef();
  // a ref that is used to keep track of the current scroll position
  // when the number of notesToRender goes over/below the threshold, we will unmount the current list and mount the other one
  // this will result in losing the scroll position and we will use this ref to recover
  const scrollTopRef = useRef(0);
  const VIRTUALIZATION_THRESHOLD = 50;

  const dispatch = useDispatch();

  const addTheFirstComment = () => {
    const annotationManager = core.getAnnotationManager();
    const defaultStickyColor = new window.Core.Annotations.Color(3, 89, 112, 1);
    const stickyAnnotation = new window.Core.Annotations.StickyAnnotation();
    const pageSize = core.getPageInfo(currentPage);
    const pageRotation = core.getCompleteRotation(currentPage) * 90;
    const averageAnnotationSize = stickyAnnotation.Width / 2;
    const isPageLandscape = pageRotation === 90 || pageRotation === 270;
    const X = (isPageLandscape ? pageSize.height : pageSize.width) / 2 - averageAnnotationSize;
    const Y = (isPageLandscape ? pageSize.width : pageSize.height) / 2 - averageAnnotationSize;

    dispatch(actions.closeElement('rightPanel'));

    stickyAnnotation.Rotation = pageRotation;
    stickyAnnotation.PageNumber = currentPage;
    stickyAnnotation.setX(X);
    stickyAnnotation.setY(Y);
    stickyAnnotation.Author = core.getCurrentUser();
    stickyAnnotation.StrokeColor = defaultStickyColor;
    updateAnnotationAvatarSource({ annotation: stickyAnnotation, currentUser });
    annotationManager.drawAnnotationsFromList([stickyAnnotation]);
    annotationManager.addAnnotation(stickyAnnotation);

    if (!core.isContinuousDisplayMode()) {
      core.setDisplayMode(core.CoreControls.DisplayModes.Continuous);
      core.jumpToAnnotation(stickyAnnotation);
    }

    dispatch(actions.setSelectedComment(stickyAnnotation.Id));
    core.selectAnnotation(stickyAnnotation);
    dispatch(actions.triggerNoteEditing());
  };

  useEffect(() => {
    const onDocumentUnloaded = () => {
      setNotes([]);
      setSelectedNoteIds({});
      setSearchInput('');
    };
    core.addEventListener('documentUnloaded', onDocumentUnloaded);
    return () => {
      core.removeEventListener('documentUnloaded', onDocumentUnloaded);
    };
  }, []);

  useEffect(() => {
    const _setNotes = () => {
      const noteList = core.getAnnotationsList().filter((annot) => isNotReplyComment(annot) && annot.getContents());

      setNotes(noteList);
    };
    _setNotes();

    core.addEventListener('annotationChanged', _setNotes);
    core.addEventListener('annotationHidden', _setNotes);

    return () => {
      core.removeEventListener('annotationChanged', _setNotes);
      core.removeEventListener('annotationHidden', _setNotes);
    };
  }, []);

  useEffect(() => {
    const onAnnotationSelected = () => {
      const ids = {};

      const annotsSelected = core.getSelectedAnnotations().filter(isNotReplyComment);

      setIsFocusInput(true);
      annotsSelected.forEach((annot) => {
        ids[annot.Id] = true;
      });
      setSelectedNoteIds(ids);
    };
    core.addEventListener('annotationSelected', onAnnotationSelected);
    return () => {
      core.removeEventListener('annotationSelected', onAnnotationSelected);
    };
  }, []);

  // this effect should be removed once the next version of react-virtualized includes
  // the fix for https://github.com/bvaughn/react-virtualized/issues/1375.
  // we are doing this because we want to maintain the scroll position when we switch between panels
  // currently we are unmounting this component when we clicked other panel tabs
  // when the fix is out, we don't need to unmount this component anymore, and thus we don't call scrollToPosition whenever this panel is displaying
  useEffect(() => {
    if (display === 'flex' && listRef.current && scrollTopRef.current) {
      listRef.current.scrollToPosition(scrollTopRef.current);
    }
  }, [display]);

  const handleScroll = (scrollTop) => {
    if (scrollTop) {
      scrollTopRef.current = scrollTop;
    }
  };

  const renderChild = ({
    notes,
    index,
    // when we are virtualizing the notes, all of them will be absolutely positioned
    // this function needs to be called by a Note component whenever its height changes
    // to clear the cache(used by react-virtualized) and recompute the height so that each note
    // can have the correct position
    resize = () => {},
  }) => {
    let listSeparator = null;
    const { shouldRenderSeparator, getSeparatorContent } = getSortStrategies()[sortStrategy];
    const prevNote = index === 0 ? null : notes[index - 1];
    const currNote = notes[index];

    if (shouldRenderSeparator && getSeparatorContent && (!prevNote || shouldRenderSeparator(prevNote, currNote))) {
      listSeparator = <ListSeparator renderContent={() => getSeparatorContent(prevNote, currNote, { pageLabels })} />;
    }
    // can potentially optimize this a bit since a new reference will cause consumers to rerender
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const contextValue = {
      searchInput,
      resize,
      isSelected: selectedNoteIds[currNote.Id],
      isFocusInput,
      setIsFocusInput,
      isContentEditable: core.canModify(currNote),
      isMyNoteToExport: false,
    };
    return (
      <div className="note-wrapper" id={`${currNote.Id}-right`}>
        {listSeparator}
        <NoteContext.Provider value={contextValue}>
          <NoteLumin annotation={currNote} isCommentPanel={false} isInRightSideBar />
        </NoteContext.Provider>
      </div>
    );
  };

  const notesToRender = getSortStrategies()[sortStrategy].getSortedNotes(notes);

  // keep track of the index of the single selected note in the sorted and filtered list
  // in order to scroll it into view in this render effect
  const ids = Object.keys(selectedNoteIds);
  let singleSelectedNoteIndex = -1;
  if (ids.length === 1) {
    singleSelectedNoteIndex = notesToRender.findIndex((note) => note.Id === ids[0]);
  }

  useEffect(() => {
    let scrollToRowTimeout;
    if (Object.keys(selectedNoteIds).length && singleSelectedNoteIndex !== -1) {
      scrollToRowTimeout = setTimeout(() => {
        // wait for the previous selected annotation to resize() after closing before scrolling to the newly selected one
        listRef.current?.scrollToRow(singleSelectedNoteIndex);
      }, 0);
    }
    return () => {
      scrollToRowTimeout && clearTimeout(scrollToRowTimeout);
    };
  }, [selectedNoteIds]);

  const isVirtualizedList = notesToRender.length > VIRTUALIZATION_THRESHOLD;

  const renderNote = () => {
    if (isVirtualizedList) {
      return (
        <VirtualizedList
          ref={listRef}
          notes={notesToRender}
          sortStrategy={sortStrategy}
          onScroll={handleScroll}
          initialScrollTop={scrollTopRef.current}
          selectedIndex={singleSelectedNoteIndex}
        >
          {renderChild}
        </VirtualizedList>
      );
    }
    return (
      <NormalList ref={listRef} notes={notesToRender} onScroll={handleScroll} initialScrollTop={scrollTopRef.current}>
        {renderChild}
      </NormalList>
    );
  };
  const renderAddFirstComment = () =>
    canComment && (
      <Tooltip content={t('viewer.rightPanel.addCommentsAndAnnotations')} additionalClass="tooltip_viewer">
        <ButtonMaterial
          className="AddNewComment_btn"
          onClick={handlePromptCallback({ callback: addTheFirstComment, translator: t })}
        >
          <Icomoon className="add-comment" size={18} color={Colors.NEUTRAL_0} />
          <span className="add-comment-title">{t('viewer.rightPanel.addAComment')}</span>
        </ButtonMaterial>
      </Tooltip>
    );

  const renderNoAnnotations = () => (
    <div className="no-annotations">
      <SvgElement className="center-of-panel" content="double-comment" width={80} height={80} />
      <p>{t('viewer.rightPanel.thereAreNoCommentsYet')}</p>
      {renderAddFirstComment()}
    </div>
  );

  const themeProvider = Styled.Theme[themeMode];

  const renderNotesOrNothing = () => (notesToRender.length === 0 ? renderNoAnnotations() : renderNote());

  // when either of the other two panel tabs is clicked, the "display" prop will become "none"
  // like other two panels, we should set the display style of the div to props.display
  // but if we do this, sometimes a maximum updates errors will be thrown from react-virtualized if we click the other two panels
  // it looks like the issue is reported here: https://github.com/bvaughn/react-virtualized/issues/1375
  // the PR for fixing this issue has been merged but not yet released so as a workaround we are unmounting
  // the whole component when props.display === 'none'
  // this should be changed back after the fixed is released in the next version of react-virtualized
  /* eslint-disable no-nested-ternary */

  return isDisabled || display === 'none' ? null : (
    <ThemeProvider theme={themeProvider}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className={classNames('Panel NotesPanel custom-scrollbar', {
          virtualizedList: isVirtualizedList,
        })}
        data-element="notesPanel"
        ref={panelRef}
        onMouseDown={core.deselectAllAnnotations}
      >
        {renderNotesOrNothing()}
      </div>
    </ThemeProvider>
  );
};

CommentNotesPanel.propTypes = {
  display: PropTypes.string.isRequired,
  currentUser: PropTypes.object,
  currentDocument: PropTypes.object,
};

CommentNotesPanel.defaultProps = {
  currentUser: {},
  currentDocument: {},
};

const mapStateToProp = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
});

export default compose(withApollo, connect(mapStateToProp))(CommentNotesPanel);
