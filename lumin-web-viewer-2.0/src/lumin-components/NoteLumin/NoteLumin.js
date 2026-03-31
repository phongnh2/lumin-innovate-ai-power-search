/* eslint-disable no-use-before-define */
/* eslint-disable sonarjs/cognitive-complexity */
import { withApollo } from '@apollo/client/react/hoc';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {
  useEffect, useRef, useContext, useState,
} from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import { store } from 'src/redux/store';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { isComment } from 'lumin-components/CommentPanel/helper';
import Icomoon from 'luminComponents/Icomoon';
import CommentContext from 'luminComponents/NoteCommentBox/CommentContext';
import NoteContent from 'luminComponents/NoteContent';
import NoteContext from 'luminComponents/NoteLumin/Context';

import { useTranslation } from 'hooks';

import getCurrentRole from 'helpers/getCurrentRole';
import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';
import setToolModeAndGroup from 'helpers/setToolModeAndGroup';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import CommentState from 'constants/commentState';
import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { DOCUMENT_ROLES } from 'constants/lumin-common';
import toolsName, { TOOLS_NAME } from 'constants/toolsName';

import { emitModifyParentNote, toggleDisplayNote } from './helpers';
import './NoteLumin.scss';

const DeleteThreadPopup = lazyWithRetry(/* webpackPrefetch: true */ () => import('./DeleteThreadPopup'));
const ReplyArea = lazyWithRetry(/* webpackPrefetch: true */ () => import('lumin-components/NoteLumin/ReplyArea'));

const propTypes = {
  annotation: PropTypes.object.isRequired,
  isCommentPanel: PropTypes.bool.isRequired,
  isInRightSideBar: PropTypes.bool,
  isInLeftPanel: PropTypes.bool,
};

let currId = 0;
const NOTE_CONTENTS_MAX_HEIGHT = 296;
const NOTE_CONTENTS_TOOL_BAR = 34;
const REPLIES_SPLICE_HEAD = 1;
const REPLIES_SPLICE_TAIL = 2;
// eslint-disable-next-line sonarjs/cognitive-complexity
const NoteLumin = ({
  annotation, isCommentPanel, isInRightSideBar, isInLeftPanel
}) => {
  const {
    isSelected,
    resize = () => {},
    isMyNoteToExport,
    isCommentPopup = false,
  } = useContext(isCommentPanel ? CommentContext : NoteContext);
  const containerRef = useRef();
  const containerHeightRef = useRef();
  const replyTextareaRef = useRef(null);
  const resizeObserver = useRef();
  const isCommentAnnotation = annotation instanceof window.Core.Annotations.StickyAnnotation;
  const ids = useRef([]);
  const [isShowDeleteOverlay, setIsShowDeleteOverlay] = useState(false);
  const [reTriggerResize, setReTriggerResize] = useState(false);
  const [showLessReplies, setShowLessReplies] = useState(true);

  const annotManager = core.getAnnotationManager();
  const { t } = useTranslation();

  const [noteTransformFunction, currentDocument, currentUser, isOffline] =
    useSelector(
      (state) => [
        selectors.getNoteTransformFunction(state),
        selectors.getCurrentDocument(state),
        selectors.getCurrentUser(state),
        selectors.isOffline(state),
      ],
      shallowEqual,
    );
  const dispatch = useDispatch();
  const currentDocumentRole = getCurrentRole(currentDocument);
  const isResolved = isCommentAnnotation && annotation.getState() === CommentState.Resolved.state;
  const isReOpenByReply = useRef(false);
  const withHighlightAnno = core
    .getAnnotationsList()
    .find((anno) => anno.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key) === annotation.Id);
  const hasContent = !!annotation.getContents();
  useEffect(() => {
    core.addEventListener('addReply', handleAddRely);
    return () => core.removeEventListener('addReply', handleAddRely);
  }, []);

  useEffect(() => {
    const prevHeight = containerHeightRef.current;
    const currHeight = containerRef.current.getBoundingClientRect().height;
    containerHeightRef.current = currHeight;
    // have a prevHeight check here because we don't want to call resize on mount
    // use Math.round because in some cases in IE11 these two numbers will differ in just 0.00001
    // and we don't want call resize in this case
    if (prevHeight && Math.round(prevHeight) !== Math.round(currHeight)) {
      resize();
    }
  }, [isSelected, resize]);

  const resizeObserverHandler = (entries) => {
    entries.forEach((entry) => {
      if (entry.contentBoxSize || entry.contentRect) {
        const inputHeight = entry.contentBoxSize?.blockSize || entry.contentRect?.height;
        const newMaxHeight = NOTE_CONTENTS_MAX_HEIGHT - inputHeight + NOTE_CONTENTS_TOOL_BAR;
        containerRef.current.firstChild.style.maxHeight = `${newMaxHeight}px`;
      }
    });
  };

  useEffect(() => {
    const textArea = replyTextareaRef?.current?.getEditingArea();
    if (isCommentPopup && textArea) {
      containerRef.current.firstChild.style.maxHeight = `${NOTE_CONTENTS_MAX_HEIGHT}px`;
      resizeObserver.current = new ResizeObserver(resizeObserverHandler);
      resizeObserver.current.observe(textArea);
    }
    return () => {
      resizeObserver.current && resizeObserver.current.disconnect();
    };
  }, [isCommentPopup, hasContent, reTriggerResize]);

  useEffect(() => {
    if (noteTransformFunction) {
      ids.current.forEach((id) => {
        const child = document.querySelector(
          `[data-webviewer-custom-element='${id}']`,
        );
        if (child) {
          child.parentNode.removeChild(child);
        }
      });

      ids.current = [];

      const state = {
        annotation,
        isSelected,
      };

      noteTransformFunction(containerRef.current, state, (...params) => {
        const element = document.createElement(...params);
        const id = `custom-element-${currId}`;
        currId++;
        ids.current.push(id);
        element.setAttribute('data-webviewer-custom-element', id);
        element.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });

        return element;
      });
    }
  });

  useEffect(() => {
    withHighlightAnno && toggleDisplayNote(isResolved, withHighlightAnno);
  }, [isResolved]);

  const handleAddRely = (anno, parent, root) => {
    if (isReOpenByReply.current && anno.getStateModel() !== 'Marked' && isComment(root)) {
      anno.setState(CommentState.Cancelled.state);
      isReOpenByReply.current = false;
    }
  };

  const handleNoteClick = async (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (isMyNoteToExport) {
      return;
    }
    if (core.getToolMode()?.name === TOOLS_NAME.FREEHAND) {
      await setToolModeAndGroup(store, 'AnnotationEdit');
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

  const setCommentResolve = async (newStatus, method = 'button') => {
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

  const handleDelete = () => {
    if (withHighlightAnno) {
      core.deleteAnnotations([annotation, withHighlightAnno], {});
    } else {
      core.deleteAnnotations([annotation], {});
    }
  };

  const noteClass = classNames({
    NoteLumin: true,
    expanded: isSelected && !isMyNoteToExport,
    isParent: true,
    resolved: isResolved,
    noOverlay: !isShowDeleteOverlay && !isCommentPopup,
    'no-margin': isCommentPopup,
  });

  const canReply = currentDocumentRole !== DOCUMENT_ROLES.SPECTATOR && currentUser;
  const repliesClass = classNames({ replies: true, canReply });

  const replies = annotation.getReplies().sort((a, b) => a.DateCreated - b.DateCreated);

  const triggerResizeReply = () => {
    setReTriggerResize(true);
  };

  const openSignInModal = () => {
    dispatch(actions.openElement('requireUseCommentModal'));
  };

  const renderReplies = (replies) => replies.map((reply) => (
      <NoteContent key={reply.Id} isResolved={isResolved} annotation={reply} isCommentPanel={isCommentPanel} />
    ));

  const renderHiddenReplies = (hiddenReplies) => {
    // conditions:
    // 1. comment popup, comment list
    // 2. comment history
    // 3. left panel (notes)
    const shouldShowLessContent = isCommentPanel || (!isCommentPanel && isInRightSideBar) || isInLeftPanel;
    if (!shouldShowLessContent) {
      return renderReplies(hiddenReplies);
    }

    if (!showLessReplies) {
      return (
        <>
          {renderReplies(hiddenReplies)}
          <div role="button" tabIndex={0} className="show-hide-replies-toggler show-hide-replies-toggler--show-less" onClick={() => setShowLessReplies(true)}>
            <div className='show-hide-replies-toggler__icon-wrapper'>
              <Icomoon className="collapse-to-top" size={12} />
            </div>
            <span className='show-hide-replies-toggler__title'>{t('common.hideOlderReplies')}</span>
          </div>
        </>
      );
    }
    return (
      <div role="button" tabIndex={0} className="show-hide-replies-toggler" onClick={() => setShowLessReplies(false)}>
        <span className='show-hide-replies-toggler__title'>{t('common.showMoreReplies', { number: hiddenReplies.length })}</span>
      </div>
    );
  };

  const renderRepliesWithHiddenCondition = () => {
    const { length } = replies;
    if (length < 5) {
      return renderReplies(replies);
    }

    const _replies = [...replies];

    const head = _replies.splice(0, REPLIES_SPLICE_HEAD);
    const body = _replies.splice(0, _replies.length - REPLIES_SPLICE_TAIL);
    const tail = [..._replies];

    return (
      <>
        {renderReplies(head)}
        {renderHiddenReplies(body)}
        {renderReplies(tail)}
      </>
    );
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={noteClass}
      ref={containerRef}
      onMouseDown={handlePromptCallback({
        callback: handleNoteClick,
        applyForTool: toolsName.REDACTION,
        translator: t,
      })}
    >
      <div className="NoteLumin__wrapper-note-content" role="button" tabIndex={0}>
        <NoteContent
          setIsShowDeleteOverlay={(status) => {
            if (replyTextareaRef.current) {
              replyTextareaRef.current.blur();
            }
            setIsShowDeleteOverlay(status);
          }}
          annotation={annotation}
          isResolved={isResolved}
          isCommentPanel={isCommentPanel}
          setCommentResolve={setCommentResolve}
          openSignInModal={openSignInModal}
        />

        {!isMyNoteToExport && (
          <div className={repliesClass}>
            {renderRepliesWithHiddenCondition()}

            {isSelected && canReply && !isCommentPopup ? (
              <ReplyArea
                replyTextareaRef={replyTextareaRef}
                annotation={annotation}
                handleReplyReopen={() => setCommentResolve(false, 'reply')}
                isResolved={isResolved}
                changeIsReOpenByReply={(status) => (isReOpenByReply.current = status)}
                isCommentPanel={isCommentPanel}
              />
            ) : (
              <div />
            )}
          </div>
        )}
        {isShowDeleteOverlay && (
          <DeleteThreadPopup
            isCommentAnnotation={isCommentAnnotation}
            setIsShowDeleteOverlay={setIsShowDeleteOverlay}
            handleDelete={handleDelete}
          />
        )}
      </div>
      {canReply && isCommentPopup && (
        <ReplyArea
          triggerResize={triggerResizeReply}
          replyTextareaRef={replyTextareaRef}
          annotation={annotation}
          handleReplyReopen={() => setCommentResolve(false, 'reply')}
          isResolved={isResolved}
          changeIsReOpenByReply={(status) => (isReOpenByReply.current = status)}
          isCommentPanel={isCommentPanel}
        />
      )}
    </div>
  );
};

NoteLumin.propTypes = propTypes;
NoteLumin.defaultProps = {
  isInRightSideBar: false,
  isInLeftPanel: false,
};

export default withApollo(NoteLumin);
