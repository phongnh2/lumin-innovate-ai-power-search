import { CustomMessageType } from 'features/AIChatBot/interface';

import { CHATBOT_SOURCE_PARTS } from '../constants';
import { Node } from '../markdown-plugins/type';

export type ErrorDetailsType = {
  blockTime: number;
};

export type UseChatErrorType = {
  code: string;
  details: ErrorDetailsType;
};

export type ToolCallType = {
  toolName: string;
  args: unknown;
};

export type RequestBodyType = {
  metadata: {
    luminLanguage: string;
    browserLanguage: string;
    emailDomain: string;
  };
  id: string;
  documentId: string;
  message: CustomMessageType;
  sessionId: string;
  totalPage: string;
  traceId: string;
};

export type ChatbotSourcePartKey = typeof CHATBOT_SOURCE_PARTS[keyof typeof CHATBOT_SOURCE_PARTS];

export type CustomMarkdownProps = {
  node: {
    properties: Node['data']['hProperties'];
  };
};
