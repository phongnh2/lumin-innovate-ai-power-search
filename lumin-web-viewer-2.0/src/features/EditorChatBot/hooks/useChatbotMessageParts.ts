import { Message } from '@ai-sdk/react';

import { ReferenceUrlType } from 'features/AIChatBot/interface';

import { useChatbotStore } from './useChatbotStore';
import { CHATBOT_MESSAGE_STREAM_PARTS, CHATBOT_SOURCE_PARTS } from '../constants';
import { ChatbotSourcePartKey } from '../types';

type MessagePart = Message['parts'][number];
type MessageSourcePart = MessagePart & { type: 'source' };

const getSourceRawItem = <T = unknown>(
  items: Array<Record<ChatbotSourcePartKey, unknown>>,
  key: ChatbotSourcePartKey
): T[] => items.flatMap((item) => (Array.isArray(item[key]) ? (item[key] as T[]) : []));

export const useChatbotMessageParts = () => {
  const { referenceUrls, setReferenceUrls } = useChatbotStore();

  const referenceUrlsHandler = ({
    messageId,
    allSource,
  }: {
    messageId: string;
    allSource: Array<Record<ChatbotSourcePartKey, unknown>>;
  }) => {
    const newReferenceUrls = getSourceRawItem<ReferenceUrlType>(allSource, CHATBOT_SOURCE_PARTS.REFERENCE_URLS);

    if (newReferenceUrls.length > 0) {
      setReferenceUrls([...referenceUrls, ...newReferenceUrls.map((url) => ({ messageId, ...url }))]);
    }
  };

  const messagePartsHandler = ({ messageId, messageParts }: { messageId: string; messageParts: Message['parts'] }) => {
    const allSource = messageParts
      .filter((p): p is MessageSourcePart => p.type === CHATBOT_MESSAGE_STREAM_PARTS.SOURCE)
      .flatMap((p) => p.source as Array<Record<ChatbotSourcePartKey, unknown>>);

    referenceUrlsHandler({ messageId, allSource });
  };

  return { messagePartsHandler };
};
