import { Message } from '@ai-sdk/react';

import { RESPONSE_TYPE } from '../constants';

export const isEmptyResponseMessage = (message: Message) =>
  message &&
  !message.content &&
  message.parts?.length &&
  !message.parts.some((part) => part.type === RESPONSE_TYPE.TOOL_INVOCATION);

export const isEmptyRetryResponseMessage = (message: Message) =>
  isEmptyResponseMessage(message) && message?.parts?.length > 1;
