import { useContext } from 'react';

import { ChatBotContext } from '../components/ChatBotContext';
import { ChatBotContextType } from '../interface';

export const useChatBot: () => ChatBotContextType = () => {
  const context = useContext<ChatBotContextType>(ChatBotContext);
  if (!context) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
};
