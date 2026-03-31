import { Icomoon, MenuItem } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';

import { LayoutElements } from '@new-ui/constants';

import { useTranslation } from 'hooks/useTranslation';

import fireEvent from 'helpers/fireEvent';

import { useChatbotInputObservation } from 'features/AIChatBot/hooks/useChatbotInputObservation';
import { CHATBOT_AUTO_COMMANDS } from 'features/EditorChatBot/constants';

import { CUSTOM_EVENT } from 'constants/customEvent';

import { useChatbotCommandMenuItemStates } from './hooks/useChatbotCommandMenuItemStates';

interface ChatbotCommandMenuItemProps {
  commandType: string;
}

const ChatbotCommandMenuItem = ({ commandType }: ChatbotCommandMenuItemProps) => {
  const { t } = useTranslation();
  const { isDisabled, isChatBotOpen } = useChatbotCommandMenuItemStates();

  const fireChatbotCommand = (command: string) => {
    fireEvent(CUSTOM_EVENT.CHATBOT_AUTO_COMMAND, {
      command,
    });
  };

  const [isChatbotInputPresent, setPendingAction] = useChatbotInputObservation(fireChatbotCommand);

  const label = useMemo(() => {
    switch (commandType) {
      case CHATBOT_AUTO_COMMANDS.SUMMARIZE:
        return t('viewer.quickSearch.aiTools.summarize');
      case CHATBOT_AUTO_COMMANDS.ASK_ABOUT_DOCUMENT:
        return t('viewer.quickSearch.aiTools.askAboutDocument');
      case CHATBOT_AUTO_COMMANDS.REDACT_SENSITIVE_INFO:
        return t('viewer.quickSearch.aiTools.redactSensitiveInfo');
      default:
        return '';
    }
  }, [commandType, t]);

  const handlerChatbotCommand = () => {
    if (isChatBotOpen && isChatbotInputPresent) {
      fireChatbotCommand(commandType);
      return;
    }

    setPendingAction(commandType);
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.CHATBOT,
      isOpen: true,
    });
  };

  return (
    <MenuItem
      disabled={isDisabled}
      leftSection={<Icomoon type="sparkles-lg" size="lg" color="var(--kiwi-colors-surface-on-surface)" />}
      onClick={handlerChatbotCommand}
    >
      {label}
    </MenuItem>
  );
};

export default ChatbotCommandMenuItem;
