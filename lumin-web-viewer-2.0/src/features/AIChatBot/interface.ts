import { Message } from '@ai-sdk/react';

import { FEEDBACK_TYPE } from './constants';
import { ATTACHED_FILES_SOURCE, ATTACHED_FILES_STATUS } from './constants/attachedFiles';
import { AI_MODE } from './constants/mode';

export type CustomMessageType = Message & {
  isOldMessage?: boolean;
  contentWithCitations?: string;
};

export type ChatBotFeedbackTrackingType = {
  answer?: string;
  answerPosition?: string;
  feedback?: string;
  session_id?: string;
  function_name?: string;
  survey?: string;
  response_id?: string;
  toolName?: string;
};

export type ChatBotFeedbackReasonType = {
  key: string;
  value: string;
  label: string;
};

export interface ChatBotContextType {
  messages: CustomMessageType[];
  setInput: (input: string) => void;
  input: string;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  handleSendMessage: () => Promise<void>;
  inputPromptRef: React.RefObject<HTMLDivElement>;
  setTriggerSubmit: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  stop: () => void;
  stopCallback?: () => void;
  isProcessing: boolean;
  isMessageAnimated: boolean;
  setMessages: (messages: CustomMessageType[] | ((messages: CustomMessageType[]) => CustomMessageType[])) => void;
  reload: () => Promise<string>;
  chatSessionId?: string;
}

export type FeedbackType = typeof FEEDBACK_TYPE[keyof typeof FEEDBACK_TYPE];

export type SubmitFeedbackType = {
  feedbackType: FeedbackType;
  content?: string;
  toolCalling?: string;
};

type JSONObject = {
  [key: string]: JSONValue;
};

type JSONArray = JSONValue[];

type JSONValue = null | string | number | boolean | JSONObject | JSONArray;

export type SourcePartType = {
  messageId?: string;
  id: string;
  sourceType: string;
  url: string;
  title?: string;
  providerMetadata?: Record<string, Record<string, JSONValue>>;
};

export type SourceUIPartType = {
  type: 'source';
  source: SourcePartType;
};

export type AttachedFileStatusType = typeof ATTACHED_FILES_STATUS[keyof typeof ATTACHED_FILES_STATUS];

export type AttachedFilesSourceType = typeof ATTACHED_FILES_SOURCE[keyof typeof ATTACHED_FILES_SOURCE];

export type AttachedFileType = {
  id: string;
  messageId?: string;
  status: AttachedFileStatusType;
  source?: AttachedFilesSourceType;
  remoteId?: string;
  isRedisStored?: boolean;
  uniqueKey?: string;
  buffer?: ArrayBuffer;
  file: File;
};

export type HandleRemoveAttachedFileProps = {
  removeId: string;
  fileIndex: number;
};

export type ReferenceUrlType = {
  messageId?: string;
  url: string;
  title: string;
  domain: string;
  description: string;
};

export type AIModeType = {
  id: typeof AI_MODE[keyof typeof AI_MODE];
  startIcon: React.JSX.Element;
  label: string;
  description: string;
  onClickMenuItem: () => void;
};
