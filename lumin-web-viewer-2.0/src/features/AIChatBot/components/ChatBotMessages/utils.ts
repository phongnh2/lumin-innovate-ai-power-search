import { type Message } from '@ai-sdk/react';

export const getLastUserMessage = (messages: Message[]) =>
  messages.filter((message) => message.role === 'user').reverse()[0];

/**
 * Use to strip the React Markdown 'a' component for correctly streaming this text
 * ex: '[Upgrade your plan](/payment/pro/...)' => 'Upgrade your plan...'
 */
export const stripMarkdownLinks = (text: string): string => text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

export const getLastAssistantMessage = (messages: Message[]) =>
  messages.filter((message) => message.role === 'assistant').reverse()[0];
