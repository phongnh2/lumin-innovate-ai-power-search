import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { moveCursorToEnd } from 'utils/moveCursorToEnd';

import { QuickActionItem } from 'features/AIChatBot/components/ChatBotQuickActions/interface';
import { useChatBot } from 'features/AIChatBot/hooks/useChatBot';
import { useChatbotMenu } from 'features/AIChatBot/hooks/useChatbotMenu';

import { setAIMode } from '../slices';
import { filterHighlightMarkdown } from '../utils/filterHighlightMarkdown';

export const useEditorTemplateCommand = () => {
  const { setInput, inputPromptRef } = useChatBot();
  const { setIsQuickActionOpen } = useChatbotMenu();
  const dispatch = useDispatch();

  const setInputMessage = useCallback(
    (prompt: string) => {
      if (inputPromptRef.current) {
        inputPromptRef.current.innerHTML = prompt;
        moveCursorToEnd(inputPromptRef.current);
        inputPromptRef.current.focus();
        setInput(filterHighlightMarkdown(prompt));
      }
    },
    [inputPromptRef]
  );

  const onClickQuickAction = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, item: QuickActionItem) => {
      const { prompt } = item;
      setInput(filterHighlightMarkdown(prompt));
      setIsQuickActionOpen(false);
      setInputMessage(prompt);
      dispatch(setAIMode(item.mode));
    },
    [dispatch, setInput, setInputMessage, setIsQuickActionOpen]
  );

  return useMemo(
    () => ({
      onClickQuickAction,
      setInputMessage,
    }),
    [onClickQuickAction, setInputMessage]
  );
};
