/* eslint-disable react/jsx-no-bind */
/* eslint-disable sonarjs/no-collapsible-if */
/* eslint-disable sonarjs/cognitive-complexity */
import { withApollo } from '@apollo/client/react/hoc';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import classNames from 'classnames';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { connect } from 'react-redux';
import { isEmail } from 'validator';

import selectors from 'selectors';

import CircularLoading from 'lumin-components/CircularLoading';
import RichTextInput from 'lumin-components/RichTextInput';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import MaterialPopper from 'luminComponents/MaterialPopper';

import { useTranslation, useLatestRef, useThemeMode } from 'hooks';
import useOnClickOutside from 'hooks/useOnClickOutside';

import documentGraphServices from 'services/graphServices/documentGraphServices';

import { string, avatar, comment as cmt } from 'utils';

import { getNextWrappingIndex } from 'features/FormFieldAutosuggestion/utils';

import { FIELD_VALUE_MAX_LENGTH } from 'constants/formBuildTool';
import { isFormattedContent, WHITE_SPACE } from 'constants/textStyle';

import './NoteInput.scss';

NoteInput.propTypes = {
  className: PropTypes.string,
  currentUser: PropTypes.object,
  inputRef: PropTypes.object,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  readOnly: PropTypes.bool,
  shouldLimitHeight: PropTypes.bool,
  annotation: PropTypes.object.isRequired,
  currentDocument: PropTypes.object.isRequired,
};

NoteInput.defaultProps = {
  className: '',
  currentUser: {},
  inputRef: {},
  onBlur: () => {},
  onChange: () => {},
  onFocus: () => {},
  placeholder: '',
  value: '',
  readOnly: false,
  shouldLimitHeight: false,
};

const EXPAND_NOTE_DEBOUNCE_TIME = 500;

function NoteInput(props) {
  const {
    className,
    placeholder,
    value,
    onFocus,
    onBlur,
    onChange,
    inputRef,
    currentUser,
    readOnly,
    shouldLimitHeight,
    annotation,
    currentDocument,
  } = props;

  const [showPopper, setShowPopper] = useState(false);
  const showPopperRef = useRef(showPopper);
  const listRef = useRef();

  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState(value || '');
  const [popperRef, setPopperRef] = useState();
  const [mentionList, setMentionList] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [startTagPosition, setStartTagPosition] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const { t } = useTranslation();
  const inputWrapperRef = useRef();
  const mentionListRef = useLatestRef(mentionList);
  const selectedItemRef = useLatestRef(selectedItem);
  const startTagPositionRef = useLatestRef(startTagPosition);
  const cursorPositionRef = useLatestRef(cursorPosition);
  const themeMode = useThemeMode();
  const abortController = useRef(new AbortController());

  useOnClickOutside(inputWrapperRef, () => {
    const isNoteInputFocused = inputRef.current.editor.root === document.activeElement;
    if (!inputRef.current || !isNoteInputFocused) {
      return;
    }
    inputRef.current.blur();
  });

  const isLoggedIn = Boolean(currentUser?._id);
  const debounceGetMentionList = useCallback(
    debounce(async (textToSearch) => {
      if (currentDocument.documentReference && !loading) {
        setLoading(true);
        try {
          abortController.current.abort();
          abortController.current = new AbortController();
          const mentionListData = await documentGraphServices.getMentionList(
            {
              documentId: currentDocument._id,
              searchKey: textToSearch,
            },
            { signal: abortController.current.signal }
          );
          setMentionList(mentionListData);
        } finally {
          setLoading(false);
          setShowPopper(true);
        }
      }
    }, EXPAND_NOTE_DEBOUNCE_TIME),
    []
  );

  const getUserSelection = (range, _oldRange, _source) => {
    if (range && Object.keys(range).length) {
      const { index, length } = range;
      setCursorPosition(index + length);
    }
  };

  const isIncludeValidEmail = ({ range }) => {
    const formatPosition = {
      isIncludedValidEmail: false,
      theFirstEmail: '',
      theLastEmail: '',
      startFormatPosition: 0,
      endingFormatPosition: 0,
    };

    if (range) {
      const { index, length } = range;
      let startIndex = index;
      let endingIndex = index + (length - 1);
      const editor = inputRef.current.getEditor();
      // react-quill auto import \n at the end, so I have to minus 1 for this character
      const commentLength = editor.getLength() - 1;

      while (editor.getText(startIndex, 1) !== WHITE_SPACE && startIndex !== 0) {
        startIndex--;
      }

      while (editor.getText(endingIndex, 1) !== WHITE_SPACE && endingIndex < commentLength) {
        endingIndex++;
      }

      const selectedIncludesWords = editor
        .getText()
        .substring(startIndex, endingIndex)
        .split(WHITE_SPACE)
        .filter(Boolean);

      const isIncludedValidEmail = selectedIncludesWords.some(
        (word) => (word[0] === '@' && isEmail(word.substring(1, word.length))) || isEmail(word)
      );

      if (isIncludedValidEmail) {
        const firstWord = selectedIncludesWords[0];
        formatPosition.isIncludedValidEmail = isIncludedValidEmail;

        // handle user select a part of email a the beginning of their selection and style.
        if (firstWord[0] === '@' && isEmail(firstWord.substring(1, firstWord.length))) {
          formatPosition.startFormatPosition = startIndex;
          formatPosition.theFirstEmail = firstWord;
        }

        const lastWord = selectedIncludesWords[selectedIncludesWords.length - 1];
        // handle user select a part of email a the end of their selection and style.
        if (selectedIncludesWords.length && lastWord[0] === '@' && isEmail(lastWord.substring(1, lastWord.length))) {
          formatPosition.endingFormatPosition = endingIndex;
          formatPosition.theLastEmail = lastWord;
        }
      }
    }
    return formatPosition;
  };

  const getPhraseFromCursorPos = (str, cursorPos) => {
    const subString = str.substring(0, cursorPos);
    const phrase = subString.split(/\s+/);
    return phrase[phrase.length - 1];
  };

  const searchUserFromComment = () => {
    if (currentDocument.isSystemFile && !isLoggedIn) {
      return;
    }
    const phrase = getPhraseFromCursorPos(cmt.removeHTMLTag(comment), cursorPosition);
    const startWithAtSymbol = phrase.charAt(0) === '@';
    if (startWithAtSymbol) {
      debounceGetMentionList(phrase.slice(1));
      setStartTagPosition(cursorPosition - phrase.length);
    } else {
      debounceGetMentionList.cancel();
      abortController.current?.abort();
      setShowPopper(false);
    }
  };

  useEffect(() => {
    searchUserFromComment();
  }, [comment]);

  useEffect(() => {
    showPopperRef.current = showPopper;
    if (!showPopper) {
      setSelectedItem(null);
    }
  }, [showPopper]);

  useEffect(() => {
    if (!value) {
      setCursorPosition(0);
      setStartTagPosition(0);
      setComment('');
    } else {
      setComment(value);
    }
  }, [value]);

  useEffect(() => {
    function closePopper() {
      setShowPopper(false);
    }
    const documentContainerDOM = document.getElementById('DocumentContainer');
    if (inputRef.current?.getEditor()) {
      inputRef.current.getEditor().on('selection-change', getUserSelection);
    }
    documentContainerDOM.addEventListener('scroll', closePopper);
    return () => {
      documentContainerDOM.removeEventListener('scroll', closePopper);
    };
  }, []);

  function onKeyDown(e) {
    if (e.which === 8) {
      e.stopPropagation();
    }
    if (e.which === 32) {
      setShowPopper(false);
    }
    if ((e.metaKey || e.shiftKey) && e.which === 50 && currentUser) {
      if (
        comment.length === 0 ||
        ((comment.charAt(cursorPosition) === WHITE_SPACE || comment.charAt(cursorPosition) === '') &&
          (comment.charAt(cursorPosition - 1) === WHITE_SPACE ||
            comment.charAt(cursorPosition - 2) === WHITE_SPACE ||
            comment.charAt(cursorPosition - 1) === '\n' ||
            comment.charAt(cursorPosition - 2) === '\n'))
      ) {
        setStartTagPosition(cursorPosition);
      }
    }
    if (showPopperRef.current) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedItem((prevSelectedItem) => getNextWrappingIndex(1, prevSelectedItem, mentionListRef.current.length));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedItem((prevSelectedItem) =>
          getNextWrappingIndex(-1, prevSelectedItem, mentionListRef.current.length)
        );
      }
      if (
        e.key === 'Enter' &&
        mentionListRef.current &&
        typeof selectedItemRef.current === 'number' &&
        mentionListRef.current[selectedItemRef.current]
      ) {
        const user = mentionListRef.current[selectedItemRef.current];
        const shouldRemoveBreakline = true;
        onTagUser(user, shouldRemoveBreakline);
      }

      if (e.key === 'Escape') {
        setShowPopper(false);
      }
    }
  }

  const removeFormatForSelectedEmail = ({ content, editor }) => {
    const editSelector = editor.getSelection();
    const length = editSelector?.length || 0;
    const index = editSelector?.index || 0;
    const currentCursorPosition = index + length;

    const { isIncludedValidEmail, theFirstEmail, theLastEmail, startFormatPosition, endingFormatPosition } =
      isIncludeValidEmail({
        range: editSelector,
        content,
      });
    if (isIncludedValidEmail) {
      const theFirstFormat = {
        startPosition: index,
        endPosition: theFirstEmail.length + 1 - index,
      };

      const formattedInTheFirstEmail = theFirstEmail
        ? editor.getFormat(theFirstFormat.startPosition, theFirstFormat.endPosition)
        : {};
      const isFormattedTheFirstEmail = isFormattedContent(formattedInTheFirstEmail);

      if (isFormattedTheFirstEmail) {
        const theLastCharacterAfterEmail = editor.getText(startFormatPosition + theFirstEmail.length + 1, 1);
        const whiteSpacePosition = theLastCharacterAfterEmail === WHITE_SPACE ? 2 : 1;
        editor.removeFormat(startFormatPosition, theFirstEmail.length + whiteSpacePosition);
      }

      const startIndex = endingFormatPosition - theLastEmail.length;
      const theLastFormat = {
        startRemovePosition: startIndex,
        endRemovePosition: theLastEmail.length - startIndex,
      };
      const removeCharactersLength = theLastFormat.endRemovePosition + theLastFormat.startRemovePosition;
      const formattedInTheLastEmail = theLastEmail
        ? editor.getFormat(theLastFormat.startPosition, currentCursorPosition)
        : {};

      const isFormattedTheLastEmail = isFormattedContent(formattedInTheLastEmail);

      if (isFormattedTheLastEmail) {
        editor.removeFormat(theLastFormat.startRemovePosition, removeCharactersLength);
      }
    }
  };

  function onInputChange(inputContent) {
    const content = inputContent.replaceAll('&nbsp;', ' ');

    if (inputRef.current && inputRef.current.getEditor()) {
      const editor = inputRef.current.getEditor();
      if (editor.getLength() > FIELD_VALUE_MAX_LENGTH) {
        editor.deleteText(FIELD_VALUE_MAX_LENGTH, editor.getLength());
      }
      const editSelector = editor.getSelection();
      const length = editSelector?.length || 0;
      const index = editSelector?.index || 0;

      const pointerPosition = index + length;
      setCursorPosition(pointerPosition);

      if (isDeleteTagSymbol(content, comment)) {
        setShowPopper(false);
      }
      setComment(content);
      onChange(content);
      removeFormatForSelectedEmail({ content, editor });
    }
  }

  function isDeleteTagSymbol(newContent, oldContent = '') {
    const oldArray = oldContent.split('');
    const newArray = newContent.split('');
    for (let i = 0; i < oldContent.length; i++) {
      if (oldArray[i] !== newArray[i] && oldArray[i] === '@') {
        return true;
      }
    }
    return false;
  }

  function onTagUser(user, shouldRemoveBreakline = false) {
    const editor = inputRef.current.getEditor();
    editor.deleteText(startTagPositionRef.current, cursorPositionRef.current - startTagPositionRef.current);
    const mentionEmail = `@${user.email} `;
    editor.insertText(startTagPositionRef.current, mentionEmail);
    if (shouldRemoveBreakline) {
      const cursor = editor.getSelection()?.index;
      if (cursor) {
        editor.deleteText(cursor, 1);
      }
    }
    const newRichtext = editor.getText();
    setComment(newRichtext);
    setCursorPosition(editor.getSelection()?.index || 0);

    setShowPopper(false);
    inputRef.current.focus();
    onChange(newRichtext);
  }

  const handleOnBlur = useCallback(() => {
    if (!showPopperRef.current) {
      onBlur();
    }
  }, []);

  const renderMentionList = () => {
    if (showPopper && Boolean(mentionList.length)) {
      return (
        <MaterialPopper
          open
          disablePortal={false}
          parentOverflow="window"
          anchorEl={popperRef}
          placement="bottom"
          handleClose={() => setShowPopper(!showPopper)}
          classes={`NoteInput__popper ${className || ''} theme-${themeMode}`}
        >
          <div className="NoteInput__popper-container">
            <MenuList
              className={classNames('NoteInput__user-list', {
                'NoteInput__user-list--disabled': loading,
              })}
              ref={listRef}
              disablePadding
            >
              {mentionList.map((user, index) => (
                <MenuItem
                  onClick={() => onTagUser(user)}
                  className={classNames('NoteInput__user-item', {
                    isFocusing: index === selectedItem,
                  })}
                  key={user._id}
                  id={`NoteInput__item-${user._id}`}
                >
                  <Grid container alignItems="center">
                    <Grid item xs={2}>
                      <MaterialAvatar
                        size={28}
                        src={avatar.getAvatar(user.avatarRemoteId)}
                        containerClasses="comment-avatar"
                      >
                        {avatar.getTextAvatar(user.name)}
                      </MaterialAvatar>
                    </Grid>
                    <Grid item xs={10} className="NoteInput__user-item __info">
                      <p>
                        {string.getShortStringWithLimit(user.name, 30)}
                        {WHITE_SPACE}
                        {currentUser && user.id === currentUser._id ? `(${t('common.you')})` : ''}
                      </p>
                      <span>{user.email}</span>
                    </Grid>
                  </Grid>
                </MenuItem>
              ))}
            </MenuList>
            {loading && <CircularLoading className="NoteInput__loading" size={24} />}
          </div>
        </MaterialPopper>
      );
    }
    return null;
  };

  const forwardRefCallBack = (node) => {
    inputRef.current = node;
  };

  const updatePopperRef = (node) => {
    setPopperRef(node);
  };
  return (
    <div className="NoteInput__container" ref={inputWrapperRef}>
      <div className={classNames('NoteInput notranslate', {})} ref={updatePopperRef}>
        <RichTextInput
          className="NoteInput__container richTextInput"
          readOnly={readOnly}
          onKeyDown={onKeyDown}
          defaultContent={comment}
          onInputChange={onInputChange}
          onBlur={handleOnBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          ref={forwardRefCallBack}
          showDefaultValue
          shouldDisableToolBar={false}
          shouldShowToolBar
          shouldLimitHeight={shouldLimitHeight}
          annotationSubject={annotation.Subject}
        />
      </div>
      {renderMentionList()}
    </div>
  );
}

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
});

export default connect(mapStateToProps)(withApollo(memo(NoteInput)));
