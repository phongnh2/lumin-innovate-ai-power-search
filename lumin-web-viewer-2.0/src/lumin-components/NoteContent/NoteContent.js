/* eslint-disable no-use-before-define */
/* eslint-disable sonarjs/no-collapsible-if */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react-hooks/exhaustive-deps */
import { withApollo } from '@apollo/client/react/hoc';
import Button from '@mui/material/Button';
import Autolinker from 'autolinker';
import classNames from 'classnames';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import * as lodashEscape from 'lodash/escape';
import PropTypes from 'prop-types';
import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { isComment } from 'lumin-components/CommentPanel/helper';
import Tooltip from 'lumin-components/Tooltip';
import Icomoon from 'luminComponents/Icomoon';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import CommentContext from 'luminComponents/NoteCommentBox/CommentContext';
import NoteContext from 'luminComponents/NoteLumin/Context';
import NotePopupLumin from 'luminComponents/NotePopupLumin';

import { useTranslation } from 'hooks';
import useDidUpdate from 'hooks/useDidUpdate';

import getCurrentRole from 'helpers/getCurrentRole';
import mentionsManager from 'helpers/MentionsManager';

import { validator, comment, avatar } from 'utils';
import { lazyWithRetry } from 'utils/lazyWithRetry';
import { ALPHA_REGEX } from 'utils/regex';

import CommentState from 'constants/commentState';
import {
  CUSTOM_DATA_COMMENT_HIGHLIGHT,
  CUSTOM_DATA_TEXT_TOOL,
  CUSTOM_DATA_COMMENT,
} from 'constants/customDataConstant';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { DOCUMENT_ROLES, ModalTypes } from 'constants/lumin-common';
import { mapAnnotationToKey, getDataWithKey } from 'constants/map';

import * as Styled from './NoteContent.styled';

import './NoteContent.scss';

const CommentContentArea = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/CommentContentArea'));
const WarningHyperlinkContent = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/WarningHyperlinkContent'));

dayjs.extend(calendar);

const propTypes = {
  annotation: PropTypes.object.isRequired,
  setIsShowDeleteOverlay: PropTypes.func,
  isResolved: PropTypes.bool,
  setCommentResolve: PropTypes.func,
  openSignInModal: PropTypes.func,
};

const NoteContent = ({
  annotation,
  setIsShowDeleteOverlay,
  isResolved,
  isCommentPanel,
  setCommentResolve,
  openSignInModal,
}) => {
  const [
    currentUser,
    currentDocument,
    noteDateFormat,
    iconColor,
    isNoteEditingTriggeredByAnnotationPopup,
  ] = useSelector(
    (state) => [
      selectors.getCurrentUser(state),
      selectors.getCurrentDocument(state),
      selectors.getNoteDateFormat(state),
      selectors.getIconColor(state, mapAnnotationToKey(annotation)),
      selectors.getIsNoteEditing(state),
    ],
    shallowEqual,
  );

  const {
    isSelected,
    searchInput = '',
    resize = () => { },
    isContentEditable,
    isFocusInput,
    setIsFocusInput,
    editingContent = '',
    setEditingContent = () => { },
    isCommentPopup = false,
    closeCommentPopup = () => {},
  } = useContext(isCommentPanel ? CommentContext : NoteContext);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [highlightTextOpen, setHighlightTextOpen] = useState(false);
  const highlightTextRef = useRef(null);
  const highlightTextRefContainer = useRef(null);
  const [shouldShowHighlightArrow, setShouldShowHighlightArrow] = useState(true);
  const [isNotOwnerComment, setIsNotOwnerComment] = useState(false);

  const { t } = useTranslation();

  const dispatch = useDispatch();
  const isReply = annotation.isReply();
  const noReply = annotation.getReplies().length === 0;
  const isCommentAnnotation = isComment(annotation);
  const canEditComment = isCommentAnnotation && core.getCurrentUser() === annotation.Author && !isResolved;
  const replyIsStatus = isCommentAnnotation ? annotation.getStateModel() === 'Marked' : false;
  const reopenReply = isCommentAnnotation ? annotation.getState() === CommentState.Cancelled.state : false;
  const keepReplyStatus = isCommentAnnotation ? annotation.getState() === CommentState.Rejected.state : false;
  const highlightText = annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key);

  let _isMounted = true;
  const setShouldShowHighlightArrowTimer = useRef();
  useDidUpdate(() => {
    if (!isEditing) {
      dispatch(actions.finishNoteEditing());
    }

    resize();
  }, [isEditing]);

  useEffect(() => {
    const checkWidthOfHighlightText = () => {
      setShouldShowHighlightArrowTimer.current = setTimeout(() => {
        if (highlightTextRef.current && highlightTextRefContainer.current) {
          const width = highlightTextRef.current.clientWidth + 1;
          if (width <= highlightTextRefContainer.current.clientWidth) {
            setShouldShowHighlightArrow(false);
          }
        }
      }, 0);
    };

    checkWidthOfHighlightText();
    async function renderData() {
      const authorName = await renderAuthorName(annotation);
      const content = await renderContents();
      setAuthorName(authorName);
      setContent(content);
    }
    if (_isMounted) {
      renderData();
    }
    core.addEventListener('annotationChanged', onAnnotationContentUpdate);
    core.addEventListener('annotationSelected', onAnnotationSelected);
    return () => {
      _isMounted = false;
      clearTimeout(setShouldShowHighlightArrowTimer.current);
      core.removeEventListener('annotationChanged', onAnnotationContentUpdate);
      core.removeEventListener('annotationSelected', onAnnotationSelected);
    };
  }, []);

  useEffect(() => {
    if (annotation instanceof window.Core.Annotations.FreeTextAnnotation && !content) {
      updateContent();
    }
    // when the comment button in the annotation popup is clicked,
    // this effect will run and we set isEditing to true so that
    // the textarea will be rendered and focused after it is mounted
    if (isSelected && isContentEditable) {
      setIsEditing(isNoteEditingTriggeredByAnnotationPopup);
    }
  }, [isContentEditable, isNoteEditingTriggeredByAnnotationPopup, isSelected]);

  useEffect(() => {
    if (!isSelected) {
      setHighlightTextOpen(false);
    }
  }, [isSelected]);

  const updateContent = async () => {
    const content = await renderContents();
    setContent(content);
  };

  useEffect(() => {
    updateContent();
  }, [annotation]);

  const onAnnotationContentUpdate = async (annotationUpdated) => {
    if (annotationUpdated?.[0] && annotation && annotationUpdated[0].Id === annotation.Id && _isMounted) {
      updateContent();
    }
  };

  const onAnnotationSelected = (annotations, action) => {
    if (action === 'deselected') {
      setIsEditing(false);
      setIsFocusInput(false);
      setIsShowDeleteOverlay(false);
      if (isCommentPopup) {
        closeCommentPopup();
      }
    }
  };

  const handleContainerClick = useCallback(
    (e) => {
      if (isSelected) {
        // stop bubbling up otherwise the note will be closed due to annotation deselection
        // when the note is selected, we only want it to be closed when the note content header is clicked
        // because users may try to select text or click any links in contents and we don't want the note to collapse
        // when they are doing that
        e.stopPropagation();
      }
    },
    [isSelected],
  );

  const getAuthorName = async (annotation) => {
    if (!annotation) return '';
    // We save user email as author name for annotation
    let author;
    if (typeof annotation === 'string') {
      author = annotation;
    } else {
      author = annotation.Author;
    }

    if (validator.validateEmail(author)) {
      if (currentUser && author === currentUser.email) return currentUser.name;
      const sharees = mentionsManager.getUserData();
      if (sharees.some((sharee) => sharee.email === author)) {
        return sharees.find((sharee) => sharee.email === author).name;
      }
    }
    return author;
  };

  const getText = useCallback(
    (text) => {
      if (searchInput.trim()) {
        return text.replace(
          new RegExp(`(${searchInput})`, 'gi'),
          '<span class="highlight">$1</span>',
        );
      }
      if (text.includes('Anonymous')) {
        return text.split('-')[0];
      }
      return text;
    },
    [searchInput],
  );

  const renderAuthorName = useCallback(
    async (annotation) => {
      const name = await getAuthorName(annotation);
      if (!name) {
        return <span className="author">{t('viewer.noteContent.undefined')}</span>;
      }
      return <span className="author">{name}</span>;
    },
    [getText],
  );

  const renderMention = async (text) => {
    const textArray = text.split(' ');
    const replacedArray = await Promise.all(
      textArray.map(async (word) => {
        const splitWord = word.split(/\r|\n/);
        const splitWordsArray = await Promise.all(
          splitWord.map(async (sWord) => {
            const mentionSymbolOccurs = sWord.split('@');
            const mentionStartPosition = sWord.search('@');
            const isMentionEmail = mentionSymbolOccurs.length === 3 && mentionStartPosition !== -1;
            const authorEmail = isMentionEmail ? comment.removeHTMLTag(sWord.substr(mentionStartPosition + 1)) : '';

            if (isMentionEmail && validator.validateEmail(authorEmail)) {
              const name = await getAuthorName(authorEmail);
              const HTMLCharactersInComment = comment.getHTMLTagsInString(sWord).join('');
              if (!name) return sWord;
              if (name.search('@') !== -1) return name;
              return `<span class="mention">${name}</span>${HTMLCharactersInComment}`;
            }
            return sWord;
          })
        );
        return splitWordsArray.join('\n');
      })
    );
    return replacedArray.join(' ');
  };

  const handleClickHyperlink = (event, isLink) => {
    if (!isLink) {
      return;
    }
    const url = event.target.href;
    const urlObject = (new URL(url));
    const domain = urlObject.hostname.replace('www.', '');
    const subDomain = urlObject.hostname.split('.');
    const luminDomain = 'luminpdf.com';
    if (domain !== luminDomain && `${subDomain[1]}.${subDomain[2]}` !== luminDomain) {
      event.preventDefault();
      dispatch(actions.openViewerModal({
          type: ModalTypes.WARNING,
          title: t('viewer.noteContent.leavingLumin'),
          message: <WarningHyperlinkContent url={urlObject.href} />,
          cancelButtonTitle: t('common.cancel'),
          confirmButtonTitle: t('viewer.noteContent.proceed'),
          onCancel: () => dispatch(actions.closeModal()),
          onConfirm: () => {
            window.open(urlObject.href, '_blank', 'noopener,noreferrer').focus();
          },
          isFullWidthButton: true,
        })
      );
    }
  };

  const renderContents = async () => {
    const styledComment = annotation.getCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key);
    const isAnnotationFreeText = annotation.Subject === AnnotationSubjectMapping.freetext;

    let contents =
      styledComment || annotation.getContents() || annotation.getCustomData(CUSTOM_DATA_TEXT_TOOL.CONTENT.key);

    if (!contents) {
      return null;
    }

    if(isAnnotationFreeText) {
      contents = `<span>${lodashEscape(annotation.getContents())}</span>`;
    }

    let text = await renderMention(contents);

    const isContentsLinkable = Autolinker.link(text).indexOf('<a') !== -1;

    if (isContentsLinkable) {
      const linkedContent = Autolinker.link(text, { stripPrefix: false });
      // if searchInput is 't', replace <a ...>text</a> with
      // <a ...><span class="highlight">t</span>ext</a>
      text = linkedContent.replace(/>(.+)</i, (_, p1) => `>${getText(p1)}<`);
    } else {
      text = getText(text);
    }
    const commentArray = comment.commentParser(text);

    return (
      <span className="contents">
        {commentArray.map((cmt, index) => {
          const getStyleTag = comment.getHTMLTagsInString(cmt);
          const missedTag = [];

          if (getStyleTag.length) {
            getStyleTag.forEach((tag) => {
              const tagName = tag.replace(ALPHA_REGEX, '');
              const isCloseOpenTag = tag.search('/');
              const hasMoreThanOneSameTag = getStyleTag.filter((existTag) => existTag.includes(tagName)).length > 1;
              if (!hasMoreThanOneSameTag) {
                if (isCloseOpenTag >= 0) {
                  missedTag.push(`<${tagName}>`);
                  return;
                }
                missedTag.push(`</${tagName}>`);
              }
            });
          }
          const key = `${index}-${annotation.Id}`;
          const isLinkTag = cmt.startsWith('<a');
          const html = `${missedTag.join('')}${cmt}`;
          return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <span
              key={key}
              className={classNames({
                links: isLinkTag,
              })}
              onClick={(event) => handleClickHyperlink(event, isLinkTag)}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        })}
      </span>
    );
  };

  const getAvatar = useCallback(() => {
    const user = {
      avatarRemoteId: '',
      name: '',
    };
    if (!annotation) {
      return user;
    }
    // We save user email as author name for annotation
    let authorEmail;
    if (typeof annotation === 'string') {
      authorEmail = annotation;
    } else {
      authorEmail = annotation.Author;
    }
    if (validator.validateEmail(authorEmail)) {
      if (currentUser && authorEmail === currentUser.email) {
        user.avatarRemoteId = currentUser.avatarRemoteId;
        user.name = currentUser.name;
      } else {
        const sharees = mentionsManager.getUserData();
        if (sharees.some((sharee) => sharee.email === authorEmail)) {
          const shareer = sharees.find((sharee) => sharee.email === authorEmail);
          user.avatarRemoteId = shareer.avatarRemoteId;
          user.name = shareer.name;
        }
      }
    }
    return user;
  }, []);

  const getIcon = useCallback(() => {
    const { icon } = getDataWithKey(mapAnnotationToKey(annotation));
    return (
      <Styled.NoteAvatarContainer>
        <Styled.StyledMaterialAvatar
          size={32}
          fontSize={12}
          src={avatar.getAvatar(getAvatar().avatarRemoteId)}
          containerClasses="NoteAvatar"
        >
          {avatar.getTextAvatar(getAvatar().name)}
        </Styled.StyledMaterialAvatar>
        {!isCommentAnnotation && (
          <Styled.IconAnnotation>
            <Icomoon className={icon} size={7} color={annotation[iconColor]?.toHexString()} />
          </Styled.IconAnnotation>
        )}
      </Styled.NoteAvatarContainer>
    );
  }, []);

  const handleClickHighlight = () => {
    if (!isSelected) {
      return;
    }
    setHighlightTextOpen(!highlightTextOpen);
  };

  const clickResolvedButton = () => {
    const currentDocumentRole = getCurrentRole(currentDocument);
    if (!currentUser || currentDocumentRole === DOCUMENT_ROLES.SPECTATOR) {
      openSignInModal();
    } else {
      setCommentResolve(!isResolved);
    }
  };

  const formatDate = (value) => dayjs(value).calendar(null, {
    sameDay: `[${t('option.notesPanel.separator.today')}], HH:mm`,
    lastDay: `[${t('option.notesPanel.separator.yesterday')}], HH:mm`,
    lastWeek: `[${t('option.notesPanel.separator.last')}] ddd, HH:mm`,
    sameElse: noteDateFormat,
  });

  const NoteHeader = useMemo(() => {
    let header;
    if (isReply) {
      header = (
        <div className="title">
          <div className="type">
          <MaterialAvatar
              size={28}
              src={avatar.getAvatar(getAvatar().avatarRemoteId)}
            >
              {avatar.getTextAvatar(getAvatar().name)}
            </MaterialAvatar>
          </div>
          <div className="info-wrapper">
            {authorName}
            <span className="time">
              {annotation.DateCreated ? formatDate(annotation.DateCreated) : t('viewer.noteContent.noDate')}
            </span>
            </div>
          {isSelected && !isResolved && !replyIsStatus && !keepReplyStatus && (
             <NotePopupLumin
             isCommentPanel={isCommentPanel}
             annotation={annotation}
             setIsEditing={setIsEditing}
           />
          )}
        </div>
      );
    } else {
      const isNotReopenMessageAnnotation = annotation
        .getReplies()
        .filter((e) => e.getStateModel() !== 'Marked' && e.getState() !== CommentState.Rejected.state);
      const numberOfReplies = isNotReopenMessageAnnotation.length;
      header = (
        <div
          className={classNames('title', {
            comment_added: isCommentAnnotation && !content,
          })}
        >
          <div className="type">{getIcon()}</div>
          <div className="user-info">
            {authorName}
            <div className="time">
              {annotation.DateCreated ? formatDate(annotation.DateCreated) : t('viewer.noteContent.noDate')}
              {numberOfReplies > 0 && (
                <span className="reply-count">
                  <div className="circle" />
                  <Icomoon className="comment-alt" size={11} />
                  {numberOfReplies}
                </span>
              )}
            </div>
          </div>
          {isCommentAnnotation && content && currentUser && (
            <div className="check-resolved">
              <Tooltip
                content={isResolved ? t('viewer.reOpenComment') : t('viewer.markAsResolved')}
                additionalClass={`note_tooltip_edit ${isNotOwnerComment ? 'note_tooltip_edit-left' : ''}`}
              >
                <Button className="Resolved__btn" onClick={clickResolvedButton}>
                  <Icomoon className="double-check icon" size={20} />
                </Button>
              </Tooltip>
            </div>
          )}
          <NotePopupLumin
            isResolved={isResolved}
            isCommentPanel={isCommentPanel}
            setIsShowDeleteOverlay={setIsShowDeleteOverlay}
            annotation={annotation}
            setIsEditing={setIsEditing}
            setIsNotOwnerComment={setIsNotOwnerComment}
          />
        </div>
      );
    }

    return header;
  }, [isSelected, authorName, content, currentUser,keepReplyStatus, replyIsStatus, isResolved]);

  const getHighlightContainerClass = classNames({
    highlight__text: true,
    'highlight__text--opened': highlightTextOpen,
    'highlight__text--closed': !highlightTextOpen,
  });

  return useMemo(
    () => (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={classNames('NoteContent', {
          'no-content': !content && !keepReplyStatus,
          'no-reply': noReply && !isReply,
          'is-status': replyIsStatus,
        })}
        // to prevent textarea from blurring out during editing when clicking on the note content
        onMouseDown={(e) => e.preventDefault()}
      >
        <div className="NoteContent__right">
          {NoteHeader}
          {highlightText && !isCommentPanel && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              className={`highlight ${isCommentAnnotation && !content && !keepReplyStatus ? 'comment_added' : ''}`}
              onMouseDown={handleClickHighlight}
            >
              <div ref={highlightTextRefContainer} className={getHighlightContainerClass}>
                <span ref={highlightTextRef}>{highlightText}</span>
                {shouldShowHighlightArrow && (
                  <div className="icon">
                    <Icomoon className={highlightTextOpen ? 'light-arrow-up' : 'light-arrow-down'} size={16} />
                  </div>
                )}
              </div>
            </div>
          )}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className={`content-container ${
              isCommentAnnotation && !content && !keepReplyStatus ? 'comment_added' : ''
            }`}
            onMouseDown={handleContainerClick}
          >
            {isEditing && isFocusInput && canEditComment ? (
              <CommentContentArea
                onClickLinkAnnot={handleClickHyperlink}
                annotation={annotation}
                setIsEditing={setIsEditing}
                setContent={setContent}
                setIsFocusInput={setIsFocusInput}
                editingContent={editingContent}
                setEditingContent={setEditingContent}
                isCommentPopup={isCommentPopup}
                closeCommentPopup={closeCommentPopup}
              />
            ) : (
              <div className="content-container">
                {reopenReply && <p className="reopened">{t(`${CommentState.Cancelled.message}`)}</p>}
                {keepReplyStatus && <p className="reopened">{t(`${CommentState.Rejected.message}`)}</p>}
                <p className="container">{content}</p>
              </div>
            )}
          </div>
        </div>
        <hr />
      </div>
    ),
    [handleContainerClick, isEditing, renderContents, isCommentPopup, isFocusInput, canEditComment]
  );
};

NoteContent.propTypes = propTypes;
NoteContent.defaultProps = {
  setIsShowDeleteOverlay: () => {},
  isResolved: false,
  isCommentPanel: false,
  setCommentResolve: () => {},
  openSignInModal: () => {},
  userPlan: '',
};

export default withApollo(NoteContent);
