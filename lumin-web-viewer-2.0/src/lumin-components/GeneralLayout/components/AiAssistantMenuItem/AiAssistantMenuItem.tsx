import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import MenuItemShortcut from 'ui/components/MenuItemShortcut';

import { useTranslation } from 'hooks/useTranslation';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';
import { withExitFormBuildChecking } from 'helpers/toggleFormFieldCreationMode';

import ChatBot from 'features/AIChatBot/components/ChatBot';
import { useEnabledChatBot } from 'features/EditorChatBot/hooks/useEnableChatBot';

import { useToggleRightSideBarTool } from '../LuminRightSideBar/hooks/useToggleRightSideBarTool';
import { getShortcut } from '../LuminToolbar/utils';

import styles from './AiAssistantMenuItem.module.scss';

const AiAssistantMenuItem = () => {
  const { t } = useTranslation();
  const { enabled: enabledChatbot } = useEnabledChatBot();
  const { isActiveChatbot, enabledRightSideBarTool, toggleChatBot, onEnableRightSidebarTools } =
    useToggleRightSideBarTool();

  const onClickMenuItem = () => {
    if (!enabledRightSideBarTool) {
      onEnableRightSidebarTools();
    }
    toggleChatBot();
  };

  if (!enabledChatbot) {
    return null;
  }

  return (
    <MenuItem
      activated={isActiveChatbot}
      leftSection={<ChatBot.Icon className={styles.leftIcon} />}
      rightSection={<MenuItemShortcut shortcut={getShortcut('chatbot')} />}
      onClick={withExitFormBuildChecking(
        handlePromptCallback({
          callback: onClickMenuItem,
        })
      )}
    >
      {t('common.aiAssistant')}
    </MenuItem>
  );
};

export default AiAssistantMenuItem;
