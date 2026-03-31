import { parseName } from 'humanparser';
import { motion } from 'motion/react';
import React from 'react';

import { useToggleRightSidebarButton } from 'luminComponents/RightSideBar/hooks/useToggleRightSidebarButton';

import { useDocumentsRouteMatch, useGetCurrentUser, useTranslation } from 'hooks';

import ChatBot from 'features/AIChatBot/components/ChatBot';
import DefaultChatBotTitle from 'features/AIChatBot/components/ChatBotHeader/DefaultChatBotTitle';
import { useChatBot } from 'features/AIChatBot/hooks/useChatBot';
import { useAgreementSectionStore } from 'features/CNC/hooks/useAgreementSectionStore';
import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { useRandomProcessingMessage } from './hooks/useRandomProcessingMessage';
import { useWebSamplePrompt } from './hooks/useWebSamplePrompt';

import styles from './WebChatBot.module.scss';

export const WebChatBot = () => {
  const { t } = useTranslation();
  const isDocumentRouteMatch = useDocumentsRouteMatch();

  const currentUser = useGetCurrentUser();
  const { messages, status, inputPromptRef, setInput, handleSendMessage, input, stop, stopCallback, isProcessing } =
    useChatBot();
  const commands = useWebSamplePrompt();
  const processMessage = useRandomProcessingMessage([messages.filter((m) => !!m.content).length]);

  const { referenceUrls, referenceFiles, isVisible } = useChatbotStore();

  const { onToggleChatbot } = useToggleRightSidebarButton();
  const { setIsOpenAgreementSurvey } = useAgreementSectionStore();

  const toggleVisibility = () => {
    setIsOpenAgreementSurvey(isVisible);
    onToggleChatbot();
  };

  return (
    <div className={styles.wrapper} data-is-document-route-match={isDocumentRouteMatch}>
      <ChatBot.Header onClose={toggleVisibility} leftSection={<DefaultChatBotTitle />} />
      <motion.div
        key="chatbot"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className={styles.animateWrapper}
      >
        <div className={styles.contentBoxWrapper}>
          {messages.length > 0 ? (
            <ChatBot.MessageContainer
              messages={messages}
              isProcessing={status === 'submitted'}
              processMessage={processMessage}
              renderMessage={({ message }) =>
                message.role === 'assistant' ? (
                  <div style={{ overflow: 'hidden' }}>
                    <ChatBot.AssistantMessage message={message} markdownPlugins={[]} />
                    <ChatBot.ReferenceFiles messageId={message.id} referenceFiles={referenceFiles} />
                    <ChatBot.ReferenceSources messageId={message.id} referenceUrls={referenceUrls} />
                  </div>
                ) : (
                  <ChatBot.UserMessage message={message} />
                )
              }
            />
          ) : (
            <ChatBot.Welcome
              title={`${t('common.hello')} ${parseName(currentUser.name).firstName}!`}
              description={t('webChatBot.welcome')}
              commands={commands}
            />
          )}
          <ChatBot.Input
            inputPromptRef={inputPromptRef}
            setValueState={setInput}
            onSubmit={handleSendMessage}
            disabledSubmit={(!input && status === 'ready') || status === 'streaming' || isProcessing}
            isProcessing={isProcessing}
            placeholder={t('viewer.chatbot.placeholder')}
            stop={stop}
            stopCallback={stopCallback}
          />
          <ChatBot.Disclaimer message={t('viewer.chatbot.disclaimer')} />
        </div>
      </motion.div>
    </div>
  );
};

export default WebChatBot;
