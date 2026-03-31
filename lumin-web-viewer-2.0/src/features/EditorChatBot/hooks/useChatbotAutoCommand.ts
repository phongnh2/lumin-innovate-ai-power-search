import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { LayoutElements } from '@new-ui/constants';

import selectors from 'selectors';

import { useTranslation } from 'hooks/useTranslation';

import { useChatBot } from 'features/AIChatBot/hooks/useChatBot';

import { CUSTOM_EVENT } from 'constants/customEvent';

import { useEditorTemplateCommand } from './useEditorTemplateCommand';
import { mappingCommandWithPrompt } from '../utils/mappingCommandWithPrompt';

export const useChatbotAutoCommand = () => {
  const { t } = useTranslation();
  const isRightPanelOpen = useSelector(selectors.isRightPanelOpen);
  const rightPanelValue = useSelector(selectors.rightPanelValue);
  const isChatBotOpen = rightPanelValue === LayoutElements.CHATBOT && isRightPanelOpen;

  const { isProcessing } = useChatBot();
  const { setInputMessage, onClickQuickAction } = useEditorTemplateCommand();

  useEffect(() => {
    if (!isChatBotOpen || isProcessing) {
      return undefined;
    }

    const handleChatbotCommand = (e: CustomEvent<{ command: string }>) => {
      const { command: currentCommand } = e.detail;
      const prompt = mappingCommandWithPrompt(currentCommand, t);
      onClickQuickAction(null, { prompt });
    };

    const handleChatbotAutoSetInputMessage = (e: CustomEvent<{ message: string }>) => {
      const { message } = e.detail;
      setInputMessage(message);
    };

    window.addEventListener(CUSTOM_EVENT.CHATBOT_AUTO_COMMAND, handleChatbotCommand);
    window.addEventListener(CUSTOM_EVENT.CHATBOT_AUTO_SET_INPUT_MESSAGE, handleChatbotAutoSetInputMessage);
    return () => {
      window.removeEventListener(CUSTOM_EVENT.CHATBOT_AUTO_COMMAND, handleChatbotCommand);
      window.removeEventListener(CUSTOM_EVENT.CHATBOT_AUTO_SET_INPUT_MESSAGE, handleChatbotAutoSetInputMessage);
    };
  }, [isChatBotOpen, isProcessing, onClickQuickAction, setInputMessage, t]);
};
