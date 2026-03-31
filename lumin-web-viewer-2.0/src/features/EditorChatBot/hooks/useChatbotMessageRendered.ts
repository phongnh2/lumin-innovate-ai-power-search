import produce from 'immer';
import get from 'lodash/get';
import { useEffect } from 'react';

import { ChatBotContextType, CustomMessageType } from 'features/AIChatBot/interface';

import { CUSTOM_EVENT } from 'constants/customEvent';

const CITATION_START_TEXT = '[cite_start]';
const CITATION_END_TEXT = 'cite';
const SPECIAL_CHARACTERS_TO_ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;
const ESCAPED_MATCH_REPLACEMENT = '\\$&';

export const useChatbotMessageRendered = ({ setMessages }: { setMessages: ChatBotContextType['setMessages'] }) => {
  useEffect(() => {
    const handleAssistantMessageAnimatedEnd = (event: CustomEvent<{ message: CustomMessageType }>) => {
      if (event.detail.message.contentWithCitations) {
        return;
      }

      const messageParts = get(event.detail.message, 'parts', [] as CustomMessageType['parts']);
      const sourcePart = messageParts.find((part) => part.type === 'source');
      if (!sourcePart) {
        return;
      }

      const sourceList = get(sourcePart, 'source', []) as Record<string, unknown>[];
      const source = sourceList.find(({ sourceMetadata }) => Array.isArray(sourceMetadata));
      if (!source) {
        return;
      }

      const sourceMetadata = get(source, 'sourceMetadata', []) as { text: string; citations: string[] }[];
      const sortedCandidates = [...sourceMetadata].sort((a, b) => b.text.length - a.text.length);
      let processedContent = event.detail.message.content;
      // eslint-disable-next-line no-restricted-syntax
      for (const candidate of sortedCandidates) {
        const { text, citations } = candidate;
        const citationString = citations.length > 0 ? `[${CITATION_END_TEXT}:${citations.join(',')}]` : '';
        if (!citationString) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const escapedText = text.replace(SPECIAL_CHARACTERS_TO_ESCAPE_REGEX, ESCAPED_MATCH_REPLACEMENT);
        const regex = new RegExp(`(${escapedText})`, 'gi');
        processedContent = processedContent.replace(
          regex,
          (match) => `${CITATION_START_TEXT}${match} ${citationString}`
        );
      }

      setMessages((prevMessages) =>
        produce(prevMessages, (draft) => {
          const matchMessage = draft.find((message) => message.id === event.detail.message.id);
          if (matchMessage) {
            matchMessage.contentWithCitations = processedContent;
          }
        })
      );
    };

    window.addEventListener(CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED_END, handleAssistantMessageAnimatedEnd);
    return () => {
      window.removeEventListener(
        CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED_END,
        handleAssistantMessageAnimatedEnd
      );
    };
  }, []);
};
