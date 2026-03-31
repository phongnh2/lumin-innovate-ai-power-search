import { TFunction } from 'i18next';
import React from 'react';

import ChatbotCommandMenuItem from '@new-ui/components/ChatbotCommandMenuItem';

import { CHATBOT_AUTO_COMMANDS } from 'features/EditorChatBot/constants';
import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';
import { QuickSearchToolType } from 'features/QuickSearch/types';

const getAiCommandsConfiguration = (t: TFunction) => [
  {
    key: QUICK_SEARCH_TOOLS.SUMMARY_DOCUMENT,
    title: t('viewer.quickSearch.aiTools.summarize'),
    commandType: CHATBOT_AUTO_COMMANDS.SUMMARIZE,
  },
  {
    key: QUICK_SEARCH_TOOLS.ASK_ABOUT_DOCUMENT,
    title: t('viewer.quickSearch.aiTools.askAboutDocument'),
    commandType: CHATBOT_AUTO_COMMANDS.ASK_ABOUT_DOCUMENT,
  },
  {
    key: QUICK_SEARCH_TOOLS.REDACT_SENSITIVE_INFO,
    title: t('viewer.quickSearch.aiTools.redactSensitiveInfo'),
    commandType: CHATBOT_AUTO_COMMANDS.REDACT_SENSITIVE_INFO,
  },
];

export const getAiTools = (t: TFunction): QuickSearchToolType[] => {
  const aiTools = getAiCommandsConfiguration(t);

  return aiTools.map(({ key, title, commandType }) => ({
    key,
    title,
    element: <ChatbotCommandMenuItem commandType={commandType} />,
  }));
};
