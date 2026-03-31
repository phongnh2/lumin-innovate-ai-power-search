import { Message } from '@ai-sdk/react';

import { hasResponseFromChatbot } from '../checkResponseChatbot';

describe('hasResponseFromChatbot', () => {
  // Helper functions to reduce duplication
  const createUserMessage = (id: string, content: string): Message => ({
    id,
    role: 'user',
    content,
  });

  const createAssistantMessage = (id: string, content: string): Message => ({
    id,
    role: 'assistant',
    content,
  });

  const testMessages = (messages: Message[], expectedResult: boolean) => {
    const result = hasResponseFromChatbot(messages);
    expect(result).toBe(expectedResult);
  };

  it('should return true when there is an assistant message with msg- prefix', () => {
    const messages: Message[] = [
      createUserMessage('user-1', 'Hello'),
      createAssistantMessage('msg-123', 'Hi there!'),
      createUserMessage('user-2', 'How are?'),
    ];

    testMessages(messages, true);
  });

  it('should return false when there are no assistant messages', () => {
    const messages: Message[] = [createUserMessage('user-1', 'Hello'), createUserMessage('user-2', 'How are you?')];

    testMessages(messages, false);
  });

  it('should return false when assistant message does not have msg- prefix', () => {
    const messages: Message[] = [
      createUserMessage('user-1', 'Hello'),
      createAssistantMessage('assistant-123', 'Hi there!'),
    ];

    testMessages(messages, false);
  });

  it('should return false for empty messages array', () => {
    const messages: Message[] = [];

    testMessages(messages, false);
  });

  it('should return true when multiple assistant messages exist with msg- prefix', () => {
    const messages: Message[] = [
      createUserMessage('user-1', 'Hello'),
      createAssistantMessage('msg-123', 'Hi there!'),
      createUserMessage('user-2', 'How are you?'),
      createAssistantMessage('msg-456', 'I am fine!'),
    ];

    testMessages(messages, true);
  });

  it('should return false when assistant message has different prefix', () => {
    const messages: Message[] = [
      createUserMessage('user-1', 'Hello'),
      createAssistantMessage('response-123', 'Hi there!'),
    ];

    testMessages(messages, false);
  });

  it('should handle messages with partial msg- prefix', () => {
    const messages: Message[] = [createUserMessage('user-1', 'Hello'), createAssistantMessage('msg', 'Hi there!')];

    testMessages(messages, false);
  });
});
