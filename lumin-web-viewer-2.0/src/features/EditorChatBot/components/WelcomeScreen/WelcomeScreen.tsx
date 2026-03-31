import React from 'react';

import ChatBotQuickActions from 'features/AIChatBot/components/ChatBotQuickActions';
import { QUICK_ACTION_HOME_SCREEN_GROUPS } from 'features/EditorChatBot/constants/quickActions';
import { useEditorTemplateCommand } from 'features/EditorChatBot/hooks/useEditorTemplateCommand';
import { useQuickActions } from 'features/EditorChatBot/hooks/useQuickActions';

const WelcomeScreen = () => {
  const { getQuickActionGroups } = useQuickActions();
  const { onClickQuickAction } = useEditorTemplateCommand();

  return (
    <ChatBotQuickActions
      actions={getQuickActionGroups(QUICK_ACTION_HOME_SCREEN_GROUPS)}
      onItemClick={onClickQuickAction}
    />
  );
};

export default WelcomeScreen;
