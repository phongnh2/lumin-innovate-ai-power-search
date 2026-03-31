import React, { useMemo } from 'react';

import ChatBotQuickActionsCategory from './ChatBotQuickActionsCategory';
import { ChatBotQuickActionsProvider } from './ChatBotQuickActionsContext';
import ChatBotQuickActionsHeader from './ChatBotQuickActionsHeader';
import ChatBotQuickActionsItem from './ChatBotQuickActionsItem';
import ChatBotQuickActionsPanel from './ChatBotQuickActionsPanel';
import ChatBotQuickActionsSection from './ChatBotQuickActionsSection';
import { QuickActionCategory, QuickActionItem } from './interface';

export type ChatBotQuickActionsProps = {
  categories?: QuickActionCategory[];
  actions: {
    [key: string]: {
      title: string;
      items: QuickActionItem[];
    };
  };
  onItemClick?: (event: React.MouseEvent<HTMLDivElement>, item: QuickActionItem) => void;
  onSelectCategory?: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
  activeCategory?: string;
};

const ChatBotQuickActions = (props: ChatBotQuickActionsProps) => {
  const { activeCategory, onSelectCategory, onItemClick, categories, actions } = props;
  const context = useMemo(
    () => ({ activeCategory, onSelectCategory, onItemClick, categories, actions }),
    [activeCategory, onSelectCategory, onItemClick, categories, actions]
  );
  return (
    <ChatBotQuickActionsProvider value={context}>
      <ChatBotQuickActionsPanel />
    </ChatBotQuickActionsProvider>
  );
};

ChatBotQuickActions.Panel = ChatBotQuickActionsPanel;
ChatBotQuickActions.Header = ChatBotQuickActionsHeader;
ChatBotQuickActions.Category = ChatBotQuickActionsCategory;
ChatBotQuickActions.Section = ChatBotQuickActionsSection;
ChatBotQuickActions.Item = ChatBotQuickActionsItem;

export default ChatBotQuickActions;
