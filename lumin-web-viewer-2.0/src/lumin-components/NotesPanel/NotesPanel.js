/* eslint-disable no-use-before-define */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable sonarjs/no-collapsible-if */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable no-nested-ternary */
import { withApollo } from '@apollo/client/react/hoc';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { isNotReplyComment } from 'lumin-components/CommentPanel/helper';
import ActionButton from 'lumin-components/ViewerCommon/ActionButton';
import Icomoon from 'luminComponents/Icomoon';
import ListSeparator from 'luminComponents/ListSeparator';
import CommentContext from 'luminComponents/NoteCommentBox/CommentContext';
import NoteContext from 'luminComponents/NoteLumin/Context';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import exportNotesToTXT from 'helpers/exportNotesToTXT';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { Colors, NOTE_FILTER_OPTIONS, NOTE_FILTER_VALUES } from 'constants/lumin-common';
import { getSortStrategies } from 'constants/sortStrategies';
import { TOOLS_NAME } from 'constants/toolsName';

import './NotesPanelLumin.scss';
import * as Styled from './NotesPanel.styled';

const NoteLumin = lazyWithRetry(() => import(/* webpackPrefetch: true */'luminComponents/NoteLumin'));
const MaterialPopper = lazyWithRetry(() => import(/* webpackPrefetch: true */'luminComponents/MaterialPopper/MaterialPopper'));
const NormalList = lazyWithRetry(() => import(/* webpackPrefetch: true */'./NormalList'));
const VirtualizedList = lazyWithRetry(() => import(/* webpackPrefetch: true */'./VirtualizedList'));

const propTypes = {
  display: PropTypes.string.isRequired,
  isRightPanel: PropTypes.bool,
};

const defaultProps = {
  isRightPanel: false,
};

const NotesPanel = ({
  display,
  isRightPanel,
}) => {
  const [
    isDisabled,
    pageLabels,
    customNoteFilter,
    themeMode,
    currentUser,
    currentDocument,
  ] = useSelector(
    (state) => [
      selectors.isElementDisabled(state, 'notesPanel'),
      selectors.getPageLabels(state),
      selectors.getCustomNoteFilter(state),
      selectors.getThemeMode(state),
      selectors.getCurrentUser(state),
      selectors.getCurrentDocument(state),
    ],
    shallowEqual,
  );
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);
  const [notes, setNotes] = useState([]);
  // the object will be in a shape of { [note.Id]: true }
  // use a map here instead of an array to achieve an O(1) time complexity for checking if a note is selected
  const [selectedNoteIds, setSelectedNoteIds] = useState({});
  const [searchInput, setSearchInput] = useState('');
  const [isFocusInput, setIsFocusInput] = useState(false);
  const [selectedOption, setSelectedOption] = useState(NOTE_FILTER_OPTIONS[0]);
  const [showFilterPopper, setShowFilterPopper] = useState(false);
  const [showExportPopper, setShowExportPopper] = useState(false);
  const [isMyNoteToExport, setIsMyNoteToExport] = useState(false);
  const { t } = useTranslation();
  const listRef = useRef();
  const panelRef = useRef();
  const filterRef = useRef();
  const exportRef = useRef();
  const dispatch = useDispatch();
  // a ref that is used to keep track of the current scroll position
  // when the number of notesToRender goes over/below the threshold, we will unmount the current list and mount the other one
  // this will result in losing the scroll position and we will use this ref to recover
  const scrollTopRef = useRef(0);
  const VIRTUALIZATION_THRESHOLD = 50;

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
    const filterByAll = (availNotes) => availNotes;
    const filterByMe = (note) => note.Author === currentUser.email;
    switch (selectedOption.value) {
      case NOTE_FILTER_VALUES.ONLY_ME:
        dispatch(actions.setCustomNoteFilter(filterByMe));
        break;
      case NOTE_FILTER_VALUES.ALL:
      default:
        dispatch(actions.setCustomNoteFilter(filterByAll));
        break;
    }
  }, [selectedOption]);

  const _setNotes = () => {
    const noteList = core.getAnnotationsList().filter((annot) => {
      if (isRightPanel) {
        return Boolean(isNotReplyComment(annot) && annot.getContents());
      }
      // TODO: Check in form builder mode
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

      const isValidNoteTool = Boolean(
        annot.ToolName && ![TOOLS_NAME.STICKY, TOOLS_NAME.FORM_BUILDER, TOOLS_NAME.REDACTION].includes(annot.ToolName)
      );

      const isValidNote = isValidNoteSubject || isValidNoteTool;
      return Boolean(
        isValidNote &&
          isNotPlaceholder &&
          !annot.isReply() &&
          !annot.Hidden &&
          !annot.isGrouped() &&
          !annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key)
      );
    });
    setNotes(noteList);
  };

  useEffect(() => {
    _setNotes();
    core.addEventListener('annotationChanged', _setNotes);
    core.addEventListener('annotationHidden', _setNotes);
    return () => {
      core.removeEventListener('annotationChanged', _setNotes);
      core.removeEventListener('annotationHidden', _setNotes);
    };
  }, []);

  useEffect(() => {
    if (!isRightPanel && !isInContentEditMode) {
      _setNotes();
    }
  },[isInContentEditMode, isRightPanel]);

  useEffect(() => {
    const onAnnotationSelected = () => {
      const ids = {};

      const annotsSelected = isRightPanel
        ? core.getSelectedAnnotations().filter(isNotReplyComment)
        : core
        .getSelectedAnnotations()
        .filter(
          (annot) =>
          ![AnnotationSubjectMapping.stickyNote, AnnotationSubjectMapping.link].includes(annot.Subject) &&
          !annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key)
          );

      isRightPanel && setIsFocusInput(true);
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

  const scrollToIndex = (index) => {
    const parent = listRef.current.children();
    const child = parent.children[index];

    const parentRect = panelRef.current.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    const isViewable =
      childRect.top >= parentRect.top &&
      childRect.top <= parentRect.top + panelRef.current.clientHeight;
    if (!isViewable) {
      panelRef.current.scrollTop = childRect.top + parent.scrollTop - parentRect.top;
    }
  };

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

  const filterNote = (note) => {
    let shouldRender = true;
    if (customNoteFilter && !isRightPanel) { // prevent filtering comments
      shouldRender = shouldRender && customNoteFilter(note);
    }
    if (searchInput) {
      const replies = note.getReplies();
      // reply is also a kind of annotation
      // https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#createAnnotationReply__anchor
      const noteAndReplies = [note, ...replies];

      shouldRender =
        shouldRender &&
        noteAndReplies.some((note) => {
          const content = note.getContents();
          const authorName = note.Author;

          return (
            isInputIn(content, searchInput) ||
            isInputIn(authorName, searchInput)
          );
        });
    }
    return shouldRender;
  };

  const isInputIn = (string, searchInput) => {
    if (!string) {
      return false;
    }

    return string.search(new RegExp(searchInput, 'i')) !== -1;
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
    const { shouldRenderSeparator, getSeparatorContent } =
      getSortStrategies().position;
    const prevNote = index === 0 ? null : notes[index - 1];
    const currNote = notes[index];

    if (
      shouldRenderSeparator &&
      getSeparatorContent &&
      (!prevNote || shouldRenderSeparator(prevNote, currNote))
    ) {
      listSeparator = (
        <ListSeparator
          renderContent={() => getSeparatorContent(prevNote, currNote, { pageLabels })}
        />
      );
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
      isMyNoteToExport: isMyNoteToExport && !isRightPanel,
    };
    const renderId = () => {
      if (isRightPanel) {
        return `${currNote.Id}-right`;
      }
      return '';
    };
    return (
      <div
        className="note-wrapper"
        id={renderId()}
      >
        {listSeparator}
        {isRightPanel ? (
          <CommentContext.Provider value={contextValue}>
            <NoteLumin annotation={currNote} isCommentPanel />
          </CommentContext.Provider>
        ) : (
          <NoteContext.Provider value={contextValue}>
            <NoteLumin annotation={currNote} isCommentPanel={false} isInLeftPanel />
          </NoteContext.Provider>
        )}
      </div>
    );
  };

  const notesToRender = getSortStrategies()
    .position.getSortedNotes(notes)
    .filter(filterNote);

  // keep track of the index of the single selected note in the sorted and filtered list
  // in order to scroll it into view in this render effect
  const ids = Object.keys(selectedNoteIds);
  let singleSelectedNoteIndex = -1;
  if (ids.length === 1) {
    singleSelectedNoteIndex = notesToRender.findIndex(
      (note) => note.Id === ids[0],
    );
  }

  const exportNotesBySelect = () => {
    const notesToExport = notesToRender.filter((item) => {
      if (ids.includes(item.Id) && item.Author === currentUser.email) {
        return item;
      }
      return false;
    });
    exportNotesToTXT({ notesToExport, documentName: currentDocument.name });
  };

  const isVirtualizedList = notesToRender.length > VIRTUALIZATION_THRESHOLD;

  useEffect(() => {
    const selectedIds = Object.keys(selectedNoteIds);
    if (!selectedIds.length || !panelRef.current) {
      return;
    }

    if(singleSelectedNoteIndex !== -1) {
      if (!isVirtualizedList) {
        scrollToIndex(singleSelectedNoteIndex);
        return;
      }
      if (listRef.current) {
        listRef.current.scrollToRow(singleSelectedNoteIndex);
      }
    }
    // if user selects multiple of annotation singleSelectedNoteIndex will has value is -1
    if (isVirtualizedList) {
      listRef.current.onForceUpdateGrid();
    }
    // we only want this effect to happen when we select some notes
    // eslint-disable-next-line
  }, [selectedNoteIds]);

  const renderNote = () => {
    if (isVirtualizedList) {
      return (
        <VirtualizedList
          ref={listRef}
          notes={notesToRender}
          onScroll={handleScroll}
          initialScrollTop={scrollTopRef.current}
        >
          {renderChild}
        </VirtualizedList>
      );
    }
    return (
      <NormalList
        ref={listRef}
        notes={notesToRender}
        onScroll={handleScroll}
        initialScrollTop={scrollTopRef.current}
      >
        {renderChild}
      </NormalList>
    );
  };

  const renderNoAnnotations = () => {
    if (!isRightPanel) {
      return (
        <div className="no-annotations">
          <SvgElement
            className="center-of-panel"
            content="double-comment"
            width={80}
            height={80}
          />
          <p>{t('message.noAnnotations')}</p>
        </div>
      );
    }
    return (
      <div className="no-annotations">
        <SvgElement
          className="center-of-panel"
          content="double-comment"
          width={80}
          height={80}
        />
        <p>{t('viewer.notePanel.thereAreNoCommentsYet')}</p>
      </div>
    );
  };

  const toggleNoteFilter = () => {
    setShowFilterPopper(!showFilterPopper);
  };

  const themeProvider = Styled.Theme[themeMode];

  const isShowSelectedAllBtn = ids.length !== notesToRender.length;

  const renderSelectedAllText = () =>
    isShowSelectedAllBtn ? t('viewer.notePanel.selectAll') : t('viewer.notePanel.deselectAll');

  const renderNotesOrNothing = () => (notesToRender.length === 0 ? renderNoAnnotations() : renderNote());

  const renderRightExportNoteGroup = () => {
    if (!isMyNoteToExport) {
      return (
        <Styled.FilterButton onClick={toggleNoteFilter} selected={showFilterPopper} ref={filterRef}>
          <span>{t(selectedOption.label)}</span>
          <Icomoon className="dropdown" color={Colors.PRIMARY_80} size={8} style={{ marginLeft: 6 }} />
        </Styled.FilterButton>
      );
    }
    return (
      <Styled.MyNoteToExportContainer>
        <ActionButton
          icon="arrow-left"
          iconSize={18}
          onClick={() => setIsMyNoteToExport(false)}
          className="HeaderLumin__download-button"
        />
        <span>{t('viewer.notePanel.myNotes')}</span>
      </Styled.MyNoteToExportContainer>
    );
  };
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
      {!isRightPanel && (
        <>
          <Styled.FilterWrapper>
            {renderRightExportNoteGroup()}
            {showFilterPopper && (
              <MaterialPopper
                open
                classes={`theme-${themeMode}`}
                anchorEl={filterRef.current}
                handleClose={() => setShowFilterPopper(false)}
                placement="bottom-start"
                parentOverflow="viewport"
                disablePortal={false}
              >
                <Styled.List>
                  {NOTE_FILTER_OPTIONS.map((opt) => (
                    <Styled.Item key={opt.value} value={opt.value} onClick={() => setSelectedOption(opt)}>
                      <span>{t(opt.label)}</span>
                      {isEqual(opt, selectedOption) && (
                        <Icomoon className="check" color={Colors.SECONDARY_50} size={12} style={{ marginLeft: 20 }} />
                      )}
                    </Styled.Item>
                  ))}
                </Styled.List>
              </MaterialPopper>
            )}
            {selectedOption.value === NOTE_FILTER_VALUES.ONLY_ME && notesToRender.length > 0 && !isMyNoteToExport && (
              <ActionButton
                title="viewer.noteContent.export"
                icon="download-2"
                iconSize={18}
                onClick={() => setShowExportPopper(true)}
                className="HeaderLumin__download-button"
                ref={exportRef}
              />
            )}
            {isMyNoteToExport && (
              <Styled.MyNoteToExportButton onClick={() => exportNotesBySelect()}>
                {t('viewer.noteContent.export')}
              </Styled.MyNoteToExportButton>
            )}
            {showExportPopper && (
              <MaterialPopper
                open
                classes={`theme-${themeMode}`}
                anchorEl={exportRef.current}
                handleClose={() => setShowExportPopper(false)}
                placement="bottom-end"
                parentOverflow="viewport"
                disablePortal={false}
              >
                <Styled.List>
                  <Styled.Item
                    onClick={() => {
                      setIsMyNoteToExport(true);
                      setShowExportPopper(false);
                    }}
                  >
                    <span>{t('viewer.notePanel.selectMyNotesToExport')}</span>
                  </Styled.Item>
                  <Styled.Item
                    onClick={() =>
                      exportNotesToTXT({ notesToExport: notesToRender, documentName: currentDocument.name })
                    }
                  >
                    <span>{t('viewer.notePanel.exportAllMyNotes')}</span>
                  </Styled.Item>
                </Styled.List>
              </MaterialPopper>
            )}
          </Styled.FilterWrapper>
          <Styled.Divider />
        </>
      )}
      {isMyNoteToExport && !isRightPanel && (
        <Styled.FilterWrapper>
          <Styled.SelectedNoteNumber>{`${ids.length}/${notesToRender.length} selected`}</Styled.SelectedNoteNumber>
          <Styled.SelectAllButton
            onClick={() => {
              isShowSelectedAllBtn
                ? notesToRender.map((item) => item.Author === currentUser.email && core.selectAnnotation(item))
                : core.deselectAllAnnotations();
            }}
          >
            {renderSelectedAllText()}
          </Styled.SelectAllButton>
        </Styled.FilterWrapper>
      )}
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
NotesPanel.propTypes = propTypes;
NotesPanel.defaultProps = defaultProps;

export default withApollo(NotesPanel);
