import { Message } from '@ai-sdk/react';
import { TFunction } from 'i18next';

import { store } from 'store';

import { checkPlanRestrictions } from './planRestrictionsChecker';
import { CHATBOT_TOOL_NAMES, OUTLINE_MARKER_WITH_PREFIX } from '../constants';
import { useChatbotStore } from '../hooks/useChatbotStore';
import { setLatestToolCalling } from '../slices';

export const checkGeneratedOutlines = ({ message, t }: { message: Message; t: TFunction }) => {
  const chatbotStore = useChatbotStore.getState();
  const isContainOutlines = message.role === 'assistant' && message.content.includes(OUTLINE_MARKER_WITH_PREFIX);
  if (!isContainOutlines) {
    if (chatbotStore.hasGeneratedOutlines) {
      chatbotStore.setHasGeneratedOutlines(false);
    }
    return;
  }

  const planRestrictions = checkPlanRestrictions({
    toolCall: { toolName: CHATBOT_TOOL_NAMES.INSERT_OUTLINES, args: {} },
    t,
  });
  if (!planRestrictions) {
    store.dispatch(setLatestToolCalling(CHATBOT_TOOL_NAMES.GENERATE_OUTLINES));
  }
  chatbotStore.setHasGeneratedOutlines(!planRestrictions);
};
