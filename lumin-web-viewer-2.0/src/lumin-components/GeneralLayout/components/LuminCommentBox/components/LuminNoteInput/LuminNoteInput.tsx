/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import debounce from 'lodash/debounce';
import { Avatar, MenuItemBase, PlainTooltip } from 'lumin-ui/kiwi-ui';
import Quill from 'quill';
import React, { useState, memo, useMemo, useCallback, useEffect, ReactElement, useRef } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { isEmail } from 'validator';

import actions from 'actions';
import selectors from 'selectors';

import { useLatestRef } from 'hooks/useLatestRef';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import documentGraphServices from 'services/graphServices/documentGraphServices';

import { isFirefox } from 'helpers/device';

import avatarUtils from 'utils/avatar';
import commentUtils from 'utils/comment';
import { replaceSpecialCharactersWithEscapse } from 'utils/common';
import stringUtils from 'utils/string';

import { getNextWrappingIndex } from 'features/FormFieldAutosuggestion/utils';

import { FIELD_VALUE_MAX_LENGTH } from 'constants/formBuildTool';
import { KeyboardKeys } from 'constants/keyboardKey';
import {
  toolbarOptions,
  getModuleById,
  richTextIdMapping,
  DEFAULT_RICH_TEXT_ID,
  isFormattedContent,
  WHITE_SPACE,
} from 'constants/textStyle';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

import CustomInputToolBar from './components/CustomInputToolBar';
import { NoteInputProps, ValidEmailReturnValues, TMentionData, TOnTagUserParams } from './types';

import * as Styled from './LuminNoteInput.styled';

const EXPAND_NOTE_DEBOUNCE_TIME = 500;

const KEY_DIRECTION_MAPPER: Record<string, number> = {
  [KeyboardKeys.ARROW_DOWN]: 1,
  [KeyboardKeys.ARROW_UP]: -1,
};

const LuminNoteInput = ({
  onBlur = () => {},
  onFocus = () => {},
  onChange = () => {},
  defaultContent = '',
  placeholder = 'action.commentAndMention',
  readOnly = false,
  shouldDisableToolBar = false,
  shouldShowToolBar = true,
  shouldLimitHeight = false,
  annotation,
  value = '',
  isUpdateContent = false,
  inputRef = { current: null },
  isCommentPopup = false,
  isNoteHistory = false,
  setInputRef,
  isFocused,
  onConfirm,
  onContentValidation = () => {},
}: NoteInputProps): JSX.Element => {
  const [showPopper, setShowPopper] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [comment, setComment] = useState<string>(value || '');
  const [popperRef, setPopperRef] = useState<Node>(null);
  const [mentionList, setMentionList] = useState<Array<TMentionData>>([]);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [startTagPosition, setStartTagPosition] = useState<number>(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isCommentPanelOpen = useSelector(selectors.isCommentPanelOpen);
  const isFocusedRef = useLatestRef(isFocused);

  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const isShowMentionList = showPopper && Boolean(mentionList.length);

  const setUsingRichText = useCallback(() => {
    dispatch(actions.setUsingRichtext());
  }, [dispatch]);

  const setUnusedRichText = useCallback(() => {
    dispatch(actions.setUnusedRichtext());
  }, [dispatch]);

  useEffect(() => {
    if (!defaultContent) {
      return;
    }
    const quill = inputRef.current.editor as unknown as Quill;
    quill.setContents(quill.clipboard.convert({ html: defaultContent }));
    quill.setSelection(quill.getLength());
  }, []);

  useEffect(() => {
    if (isFocused) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  useEffect(() => {
    if (isCommentPanelOpen && !isCommentPopup && !isNoteHistory) {
      inputRef.current.focus();
    }
  }, [isCommentPanelOpen, isCommentPopup, isNoteHistory]);

  useEffect(() => {
    const quill = inputRef.current.getEditor();
    const editorElement = quill.root;

    const handleCompositionStart = () => {
      editorElement.classList.remove('ql-blank');
      onContentValidation(true);
    };

    editorElement.addEventListener('compositionstart', handleCompositionStart);

    return () => {
      editorElement.removeEventListener('compositionstart', handleCompositionStart);
    };
  }, [inputRef, onContentValidation]);

  const handleOnBlur = (): void => {
    setUnusedRichText();
    onBlur();
  };

  const handleOnFocus = (): void => {
    setUsingRichText();
    onFocus();
  };

  const getSelectedTextInRange = ({ startIndex = 0, endingIndex = 0 }): string[] => {
    const editor = inputRef.current.getEditor();
    return editor.getText().substring(startIndex, endingIndex).split(WHITE_SPACE).filter(Boolean);
  };

  const getMentionPosition = ({ range = null }): ValidEmailReturnValues => {
    const formatPosition = {
      isIncludedValidEmail: false,
      theFirstEmail: '',
      theLastEmail: '',
      startFormatPosition: 0,
      endingFormatPosition: 0,
    };

    if (range) {
      const { index = 0, length } = range;
      let startIndex = index;
      let endingIndex = (index as number) + (length - 1);
      const editor = inputRef.current.getEditor();
      // react-quill auto import \n at the end, so I have to minus 1 for this character
      const commentLength = editor.getLength() - 1;

      while (editor.getText(startIndex, 1) !== WHITE_SPACE && startIndex !== 0) {
        startIndex--;
      }

      while (editor.getText(endingIndex, 1) !== WHITE_SPACE && endingIndex < commentLength) {
        endingIndex++;
      }

      const selectedIncludesWords = getSelectedTextInRange({
        startIndex,
        endingIndex,
      });

      const isIncludedValidEmail = selectedIncludesWords.some(
        (word: string) => (word[0] === '@' && isEmail(word.substring(1, word.length))) || isEmail(word)
      );

      if (isIncludedValidEmail) {
        const firstWord = selectedIncludesWords[0];
        formatPosition.isIncludedValidEmail = isIncludedValidEmail;

        // handle user select a part of email a the beginning of their selection and style.
        if (firstWord.startsWith('@') && isEmail(firstWord.substring(1, firstWord.length))) {
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

  const removeFormatForSelectedEmail = ({ editor }: { editor: Quill }): void => {
    const editSelector = editor.getSelection();
    const length = editSelector?.length || 0;
    const index = editSelector?.index || 0;
    const currentCursorPosition = index + length;

    const { isIncludedValidEmail, theFirstEmail, theLastEmail, startFormatPosition, endingFormatPosition } =
      getMentionPosition({
        range: editSelector,
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
        ? editor.getFormat(theLastFormat.startRemovePosition, currentCursorPosition)
        : {};

      const isFormattedTheLastEmail = isFormattedContent(formattedInTheLastEmail);

      if (isFormattedTheLastEmail) {
        editor.removeFormat(theLastFormat.startRemovePosition, removeCharactersLength);
      }
    }
  };

  const onChangeRichText = (editingContent: string): void => {
    const content = editingContent
      .replaceAll('</p><p>', '<br>&nbsp;')
      .replace(/(<p)/gim, '<span')
      .replace(/<\/p>/gim, '</span>')
      .replaceAll('&nbsp;', ' ');

    if (inputRef.current && inputRef.current.getEditor()) {
      const editor = inputRef.current.getEditor() as unknown as Quill;
      if (editor.getLength() > FIELD_VALUE_MAX_LENGTH) {
        editor.deleteText(FIELD_VALUE_MAX_LENGTH, editor.getLength());
        return;
      }
      const editSelector = editor.getSelection();
      const length = editSelector?.length || 0;
      const index = editSelector?.index || 0;

      const pointerPosition = index + length;
      setCursorPosition(pointerPosition);

      if (selectedItemIndex === null && commentUtils.isDeleteTagSymbol(content, comment)) {
        setShowPopper(false);
      }
      setComment(content);
      onChange(content);

      const textContent = commentUtils.removeHTMLTag(content).trim();
      const hasContent = textContent.length > 0;
      onContentValidation(hasContent);

      removeFormatForSelectedEmail({ editor });
    }
  };

  const getPhraseFromCursorPos = (str: string, cursorPos: number): string => {
    const subString = str.substring(0, cursorPos);
    const phrase = subString.split(/\s+/);
    return phrase[phrase.length - 1];
  };

  const debounceGetMentionList = useCallback(
    debounce(async (textToSearch: string, user: IUser, document: IDocumentBase): Promise<void> => {
      if (user && document.documentReference && !loading) {
        setLoading(true);
        setShowPopper(true);
        try {
          const mentionListData = await documentGraphServices.getMentionList({
            documentId: document._id,
            searchKey: textToSearch,
          });
          setMentionList(mentionListData);
        } finally {
          setLoading(false);
        }
      }
    }, EXPAND_NOTE_DEBOUNCE_TIME),
    []
  );

  function onTagUser({ user, shouldRemoveBreakLine = false }: TOnTagUserParams): void {
    if (!user) {
      return;
    }

    const editor = inputRef.current.getEditor();
    editor.deleteText(startTagPosition, cursorPosition - startTagPosition);
    const mentionEmail = `@${user.email} `;
    editor.insertText(startTagPosition, mentionEmail);

    const cursor = editor.getSelection()?.index;
    if (shouldRemoveBreakLine && cursor) {
      editor.deleteText(cursor, 1);
    }

    const newRichtext = editor.getText();

    setComment(newRichtext);
    setCursorPosition(cursor || 0);

    setShowPopper(false);
    inputRef.current.focus();
    onChange(newRichtext);
  }

  const onKeyDownWithoutMentioning = async (event: React.KeyboardEvent): Promise<void> => {
    const isModifierKeyPressed = event.metaKey || event.ctrlKey;
    const isEnterKeyPressed = event.key === KeyboardKeys.ENTER;
    const isInputFocused = isFocusedRef.current;

    if (isModifierKeyPressed && isEnterKeyPressed && isInputFocused) {
      await onConfirm(event);
    }
  };

  const onKeyDown = async (event: React.KeyboardEvent) => {
    if (!isShowMentionList) {
      await onKeyDownWithoutMentioning(event);
      return;
    }

    switch (event.key) {
      case KeyboardKeys.ARROW_DOWN:
      case KeyboardKeys.ARROW_UP: {
        event.preventDefault();
        setSelectedItemIndex((prevIndex) =>
          getNextWrappingIndex(KEY_DIRECTION_MAPPER[event.key], prevIndex, mentionList.length)
        );
        break;
      }
      case KeyboardKeys.ENTER: {
        event.preventDefault();
        onTagUser({ user: mentionList[selectedItemIndex], shouldRemoveBreakLine: true });
        break;
      }
      case KeyboardKeys.ESCAPE: {
        setShowPopper(false);
        break;
      }
      default: {
        break;
      }
    }
  };

  const getIdPrefix = useCallback((): string => {
    if (isCommentPopup) {
      return 'popup';
    }
    if (isNoteHistory) {
      return 'history';
    }
    return 'panel';
  }, [isCommentPopup, isNoteHistory]);

  const getRichTextId = useCallback((): string => {
    const formatedId = replaceSpecialCharactersWithEscapse(annotation.Id);
    return `${getIdPrefix()}-${richTextIdMapping[annotation.Subject] || DEFAULT_RICH_TEXT_ID}-${formatedId}`;
  }, [annotation.Id, annotation.Subject, getIdPrefix]);

  // NOTE: Dyanmic modules will cause the editor lose focus then focus again => trigger onBlur event
  const modules = useMemo(() => getModuleById(getRichTextId()), [getRichTextId]);

  useEffect(
    () => () => {
      if (isFocused) {
        setUnusedRichText();
      }
    },
    [isFocused, setUnusedRichText]
  );

  useEffect(() => {
    const searchUserFromComment = async (): Promise<void> => {
      if (currentDocument.isSystemFile) {
        return;
      }
      const phrase = getPhraseFromCursorPos(commentUtils.removeHTMLTag(comment), cursorPosition);
      const startWithAtSymbol = phrase.charAt(0) === '@';
      if (startWithAtSymbol) {
        await debounceGetMentionList(phrase.slice(1), currentUser, currentDocument);
        setStartTagPosition(cursorPosition - phrase.length);
      } else {
        debounceGetMentionList.cancel();
        setShowPopper(false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    searchUserFromComment();
  }, [comment]);

  useEffect(() => {
    if (!isShowMentionList) {
      setSelectedItemIndex(null);
    }
  }, [isShowMentionList]);

  const renderMentionList = (): ReactElement => (
    <Styled.PopperMentionContainer
      open={isShowMentionList}
      disablePortal={false}
      parentOverflow="window"
      anchorEl={popperRef}
      placement="bottom"
      handleClose={() => setShowPopper((preState) => !preState)}
    >
      <ul>
        {mentionList.map((user, index) => (
          <MenuItemBase
            size="dense"
            component="li"
            onClick={() => onTagUser({ user })}
            key={user._id}
            data-hovered={selectedItemIndex === index}
          >
            <Styled.InfoContainer>
              <Avatar
                size="sm"
                variant="outline"
                src={avatarUtils.getAvatar(user.avatarRemoteId)}
                name={avatarUtils.getTextAvatar(user.name)}
              />
              <div>
                <Styled.UserName>
                  {stringUtils.getShortStringWithLimit(user.name, 30)}{' '}
                  {currentUser && user._id === currentUser._id ? `(${t('common.you')})` : ''}
                </Styled.UserName>
                <Styled.UserEmail>{user.email}</Styled.UserEmail>
              </div>
            </Styled.InfoContainer>
          </MenuItemBase>
        ))}
      </ul>
    </Styled.PopperMentionContainer>
  );

  const renderPopperContent = useCallback(
    (): ReactElement => (
      <Trans
        i18nKey="option.richText.styleInfo"
        components={{
          b: <Styled.Bold />,
          i: <Styled.Italic />,
          u: <Styled.Underline />,
          span: <Styled.ToolTipContainer />,
        }}
      />
    ),
    []
  );

  const renderInput = () => (
    <>
      <Styled.InputArea
        limitHeight={shouldLimitHeight}
        showToolBar={shouldShowToolBar}
        $isFocusedInput={isFocused}
        onKeyDown={onKeyDown}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
        placeholder={t(placeholder || 'action.comment')}
        onChange={onChangeRichText}
        modules={modules}
        formats={toolbarOptions}
        ref={setInputRef}
        readOnly={readOnly}
        preserveWhitespace={isFirefox}
      />
      <Styled.StylesWrapper $isFocusedInput={isFocused} shouldShowToolBar={shouldShowToolBar}>
        <CustomInputToolBar toolbarId={getRichTextId()} disableToolBar={shouldDisableToolBar} />
        {isFocused && (
          <PlainTooltip content={renderPopperContent()}>
            <Styled.ToolTipIcon className="icon-sm_status_question" size={16} />
          </PlainTooltip>
        )}
      </Styled.StylesWrapper>
    </>
  );

  const updatePopperRef = (node: Node): void => {
    setPopperRef(node);
  };

  return (
    <Styled.Container ref={containerRef} isUpdateContent={isUpdateContent}>
      <Styled.PopperContainer className="NoteInput notranslate" ref={updatePopperRef}>
        <Styled.Wrapper $isFocusedInput={isFocused}>{renderInput()}</Styled.Wrapper>
      </Styled.PopperContainer>
      {renderMentionList()}
    </Styled.Container>
  );
};

export default memo(LuminNoteInput);
