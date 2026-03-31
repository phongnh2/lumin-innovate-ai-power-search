import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';

import { moveCursorToEnd } from 'utils/moveCursorToEnd';

import { useChatBot } from 'features/AIChatBot/hooks/useChatBot';
import { filterHighlightMarkdown } from 'features/EditorChatBot/utils/filterHighlightMarkdown';

import { SAMPLE_PROMPTS_INPUTS, SAMPLE_PROMPTS_OUTPUTS } from '../constants';

export const useWebSamplePrompt = () => {
  const { setInput, inputPromptRef, setMessages, messages } = useChatBot();

  const handlePredefinedResponse = (userContent: string, assistantContent: string) => {
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: userContent,
    };
    const assistantMessage = {
      id: `assistant-${Date.now() + 1}`,
      role: 'assistant' as const,
      content: assistantContent,
    };

    if (inputPromptRef.current) {
      inputPromptRef.current.innerHTML = '';
    }
    setInput('');
    setMessages([...messages, userMessage, assistantMessage]);
  };

  const handleEditablePrompt = (promptHtml: string) => {
    if (inputPromptRef.current) {
      inputPromptRef.current.innerHTML = promptHtml;
      moveCursorToEnd(inputPromptRef.current);
      inputPromptRef.current.focus();
    }
    setInput(filterHighlightMarkdown(promptHtml));
  };

  return useMemo(
    () => [
      {
        label: (
          <Trans
            i18nKey="webChatBot.exploreWhatLuminAICanDo"
            components={{ b: <b className="kiwi-message--primary" /> }}
          />
        ),
        onClick: () =>
          handlePredefinedResponse('Explore what Lumin AI can do', SAMPLE_PROMPTS_OUTPUTS.EXPLORE_LUMIN_AI),
      },
      {
        label: <Trans i18nKey="webChatBot.getHelp" components={{ b: <b className="kiwi-message--primary" /> }} />,
        onClick: () => handleEditablePrompt(SAMPLE_PROMPTS_INPUTS.GET_HELP),
      },
      {
        label: (
          <Trans i18nKey="webChatBot.summarizeDocument" components={{ b: <b className="kiwi-message--primary" /> }} />
        ),
        onClick: () => handleEditablePrompt(SAMPLE_PROMPTS_INPUTS.SUMMARIZE_PROMPT),
      },
      {
        label: (
          <Trans
            i18nKey="webChatBot.findDetailsInDocument"
            components={{ b: <b className="kiwi-message--primary" /> }}
          />
        ),
        onClick: () => handlePredefinedResponse('Find details in a document', SAMPLE_PROMPTS_OUTPUTS.FIND_DETAILS),
      },
    ],
    []
  );
};
