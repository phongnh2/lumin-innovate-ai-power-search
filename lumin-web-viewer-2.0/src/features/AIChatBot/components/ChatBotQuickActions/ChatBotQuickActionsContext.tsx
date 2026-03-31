import React, { createContext, useContext } from 'react';

import { QuickActionCategory, QuickActionItem } from './interface';

type ChatBotQuickActionsContextType = {
  activeCategory: string;
  onSelectCategory: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
  onItemClick: (e: React.MouseEvent<HTMLDivElement>, item: QuickActionItem) => void;
  categories: QuickActionCategory[];
  actions: {
    [key: string]: {
      title: string;
      items: QuickActionItem[];
      rightSection?: React.ReactNode;
    };
  };
};

export const ChatBotQuickActionsContext = createContext<ChatBotQuickActionsContextType>({
  activeCategory: '',
  onSelectCategory: () => {},
  onItemClick: () => {},
  categories: [],
  actions: {},
});

export const ChatBotQuickActionsProvider = ChatBotQuickActionsContext.Provider;

export const useChatBotQuickActions = () => useContext(ChatBotQuickActionsContext);
