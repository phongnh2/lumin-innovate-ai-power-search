import { Message } from '@ai-sdk/react';

import { ReferenceUrlType, SourcePartType } from 'features/AIChatBot/interface';

import { useChatbotStore } from './useChatbotStore';

type MessagePart = Message['parts'][number];
type MessageSourcePart = MessagePart & { type: 'source' };

const getSourceItem = <T = unknown>(items: Array<Record<string, unknown>>, key: string): T[] =>
  items.flatMap((item) => {
    if (!item[key]) {
      return [];
    }
    return Array.isArray(item[key]) ? (item[key] as T[]) : [item[key] as T];
  });

export const useChatbotMessageParts = () => {
  const { referenceUrls, setReferenceUrls, referenceFiles, setReferenceFiles } = useChatbotStore();

  const referenceUrlsHandler = ({
    messageId,
    allSource,
  }: {
    messageId: string;
    allSource: Array<Record<string, unknown>>;
  }) => {
    const newReferenceUrls = getSourceItem<ReferenceUrlType>(allSource, 'referenceUrls');

    if (newReferenceUrls.length > 0) {
      setReferenceUrls([...referenceUrls, ...newReferenceUrls.map((url) => ({ messageId, ...url }))]);
    }
  };

  const referenceFilesHandler = ({
    messageId,
    allSource,
  }: {
    messageId: string;
    allSource: Array<Record<string, unknown>>;
  }) => {
    const newReferenceFiles = getSourceItem<SourcePartType>(allSource, 'referenceFile');

    if (newReferenceFiles.length > 0) {
      setReferenceFiles([...referenceFiles, ...newReferenceFiles.map((file) => ({ messageId, ...file }))]);
    }
  };

  const messagePartsHandler = ({ messageId, messageParts }: { messageId: string; messageParts: Message['parts'] }) => {
    const allSource = messageParts
      .filter((p): p is MessageSourcePart => p.type === 'source')
      .map((p) => p.source as unknown as Record<string, unknown>);

    referenceUrlsHandler({ messageId, allSource });
    referenceFilesHandler({ messageId, allSource });
  };

  return { messagePartsHandler };
};
