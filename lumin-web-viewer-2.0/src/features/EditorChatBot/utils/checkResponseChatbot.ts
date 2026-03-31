import { Message } from '@ai-sdk/react';

import { ChatMessage } from '../slices';

export const hasResponseFromChatbot = (messages: Message[] | ChatMessage[]): boolean =>
  messages.some((message) => message.role === 'assistant' && message.id.startsWith('msg-'));
