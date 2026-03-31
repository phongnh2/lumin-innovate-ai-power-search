import { IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useToggleRightSidebarButton } from 'luminComponents/RightSideBar/hooks/useToggleRightSidebarButton';

import { useGetCurrentOrganization } from 'hooks';

import { ChatbotIcon } from 'features/WebChatBot/components/WebChatbotButton/ChatbotIcon';
import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import styles from './AskAIButton.module.scss';

const AskAIButton = () => {
  const currentOrganization = useGetCurrentOrganization();
  const { isVisible } = useChatbotStore();
  const { onToggleChatbot } = useToggleRightSidebarButton();

  const toggleVisibility = () => {
    if (!currentOrganization) {
      return;
    }
    onToggleChatbot();
  };

  return (
    <IconButton
      icon={<ChatbotIcon iconSize={24} />}
      onClick={toggleVisibility}
      data-activated={isVisible}
      className={styles.buttonWrapper}
    />
  );
};

export default AskAIButton;
