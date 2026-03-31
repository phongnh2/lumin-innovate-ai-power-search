import { TFunction } from 'react-i18next';

import { CHATBOT_AUTO_COMMANDS } from '../constants';

export const mappingCommandWithPrompt = (autoCommand: string, t: TFunction): string => {
  switch (autoCommand) {
    case CHATBOT_AUTO_COMMANDS.SUMMARIZE:
      return t('viewer.quickActions.ask.items.0.prompt');
    case CHATBOT_AUTO_COMMANDS.ASK_ABOUT_DOCUMENT:
      return t('viewer.quickActions.ask.items.1.prompt');
    case CHATBOT_AUTO_COMMANDS.REDACT_SENSITIVE_INFO:
      return t('viewer.quickActions.edit.items.0.prompt');
    default:
      return '';
  }
};
