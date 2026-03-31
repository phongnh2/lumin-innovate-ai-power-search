import { IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { getShortcut } from '@new-ui/components/LuminToolbar/utils';
import ShortcutTooltip from 'ui/components/ShortcutTooltip';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useTranslation } from 'hooks/useTranslation';

import ChatBot from 'features/AIChatBot/components/ChatBot';
import { useEnabledChatBot } from 'features/EditorChatBot/hooks/useEnableChatBot';

import { useToggleRightSideBarTool } from '../hooks/useToggleRightSideBarTool';
import styles from '../RightSideBarContent.module.scss';

const AiAssistantButton = () => {
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();
  const isInAnonymousMode = !currentUser;

  const { enabled: enabledChatbot } = useEnabledChatBot();
  const { isActiveChatbot, enabledRightSideBarTool, toggleChatBot } = useToggleRightSideBarTool();

  if (!enabledChatbot) {
    return null;
  }

  return (
    <ShortcutTooltip shortcut={getShortcut('chatbot')} content={t('common.aiAssistant')} position="left">
      <IconButton
        size="md"
        activated={isActiveChatbot}
        disabled={!enabledRightSideBarTool || isInAnonymousMode}
        onClick={toggleChatBot}
      >
        <ChatBot.Icon className={styles.aiIcon} />
      </IconButton>
    </ShortcutTooltip>
  );
};

export default AiAssistantButton;
