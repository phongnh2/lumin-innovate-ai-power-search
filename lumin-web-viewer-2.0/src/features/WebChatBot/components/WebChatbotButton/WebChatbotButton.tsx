import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useToggleRightSidebarButton } from 'luminComponents/RightSideBar/hooks/useToggleRightSidebarButton';

import { useGetCurrentOrganization, useTranslation } from 'hooks';

import { useAgreementSectionStore } from 'features/CNC/hooks/useAgreementSectionStore';
import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { ChatbotIcon } from './ChatbotIcon';

import styles from './WebChatbotButton.module.scss';

const WebChatbotButton = () => {
  const { isVisible } = useChatbotStore();
  const { onToggleChatbot } = useToggleRightSidebarButton();
  const { setIsOpenAgreementSurvey } = useAgreementSectionStore();
  const currentOrganization = useGetCurrentOrganization();
  const { t } = useTranslation();
  const toggleVisibility = () => {
    if (!currentOrganization) {
      return;
    }
    onToggleChatbot();
    setIsOpenAgreementSurvey(isVisible);
  };

  return (
    <button className={styles.wrapper} data-activated={isVisible} onClick={toggleVisibility}>
      <div className={styles.content}>
        <ChatbotIcon iconSize={20} />
        <Text type="label" size="md">
          {t('webChatBot.askAI')}
        </Text>
      </div>
    </button>
  );
};

export default WebChatbotButton;
