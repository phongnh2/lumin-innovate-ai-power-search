import { AtomIcon } from '@luminpdf/icons/dist/csr/Atom';
import { SparkleIcon } from '@luminpdf/icons/dist/csr/Sparkle';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'hooks/useTranslation';

import { DefaultChatBotTitle } from 'features/AIChatBot/components/ChatBotHeader';
import ChatBotQuickActions from 'features/AIChatBot/components/ChatBotQuickActions';
import { useHandleRefreshAI } from 'features/AIChatBot/components/WarningRefresh/hooks/useHandleRefreshAI';
import { AI_MODE } from 'features/AIChatBot/constants/mode';
import { useChatBot } from 'features/AIChatBot/hooks/useChatBot';
import { useChatbotMenu } from 'features/AIChatBot/hooks/useChatbotMenu';
import { useGetFeedbackReason } from 'features/AIChatBot/hooks/useGetFeedbackReason';
import { useGetLastAssistantMessageRef } from 'features/AIChatBot/hooks/useGetLastAssistantMessageRef';
import { SubmitFeedbackType } from 'features/AIChatBot/interface';
import { QUICK_ACTION_CONFIGS } from 'features/EditorChatBot/constants/quickActions';
import { useEditorTemplateCommand } from 'features/EditorChatBot/hooks/useEditorTemplateCommand';
import { useRandomProcessingMessage } from 'features/EditorChatBot/hooks/useRandomProcessingMessage';

import AssistantCitationsMessage from './components/AssistantCitationsMessage';
import WelcomeScreen from './components/WelcomeScreen';
import { quickActionCategories } from './constants';
import { useChatbotAutoCommand } from './hooks/useChatbotAutoCommand';
import { useChatbotMessageRendered } from './hooks/useChatbotMessageRendered';
import { useChatbotStore } from './hooks/useChatbotStore';
import { useEditorChatbotFeedback } from './hooks/useEditorChatbotFeedback';
import { useQuickActions } from './hooks/useQuickActions';
import { remarkOutlineBlock } from './markdown-plugins';
import { selectors as editorChatBotSelector, setAIMode } from './slices';
import { isEmptyResponseMessage } from './utils/isEmptyResponseMessage';
import ChatBot from '../AIChatBot/components/ChatBot';

import styles from './EditorChatBot.module.scss';

export const EditorChatBot = () => {
  const {
    messages,
    status,
    inputPromptRef,
    setInput,
    handleSendMessage,
    input,
    onClose,
    stop,
    stopCallback,
    isProcessing,
    chatSessionId,
    setMessages,
  } = useChatBot();
  const { onClickQuickAction } = useEditorTemplateCommand();
  const processMessage = useRandomProcessingMessage([messages.filter((m) => !!m.content).length]);
  const { t } = useTranslation();
  const { isValidateDocument, referenceUrls } = useChatbotStore();
  const { editorChatbotFeedbackReasons } = useGetFeedbackReason();
  const { lastAssisantMessageRef } = useGetLastAssistantMessageRef();
  const latestToolCall = messages[messages.length - 1]?.toolInvocations?.[0].toolName || null;
  const { onSubmitEditorChatbotFeedback, isFeedbackHidden } = useEditorChatbotFeedback();
  const { menuItems, isQuickActionOpen, setIsQuickActionOpen } = useChatbotMenu();
  const { getQuickActions, onSelectCategory, activeQuickActionCategory } = useQuickActions();
  const { handleRefreshDocument, isShowPopUpRefresh } = useHandleRefreshAI();
  const AIMode = useSelector(editorChatBotSelector.getAIMode) || AI_MODE.AGENT_MODE;
  const dispatch = useDispatch();

  const modes = [
    {
      id: AI_MODE.AGENT_MODE,
      startIcon: <AtomIcon width={20} height={20} color="var(--kiwi-colors-surface-on-surface)" />,
      label: t('viewer.chatbot.mode.agentMode'),
      description: t('viewer.chatbot.mode.agentModeDescription'),
      onClickMenuItem: () => {
        dispatch(setAIMode(AI_MODE.AGENT_MODE));
      },
    },
    {
      id: AI_MODE.ASK_MODE,
      startIcon: <SparkleIcon width={20} height={20} color="var(--kiwi-colors-surface-on-surface)" />,
      label: t('viewer.chatbot.mode.askMode'),
      description: t('viewer.chatbot.mode.askModeDescription'),
      onClickMenuItem: () => {
        dispatch(setAIMode(AI_MODE.ASK_MODE));
      },
    },
  ];

  useChatbotAutoCommand();
  useChatbotMessageRendered({ setMessages });

  const renderContent = () => {
    if (isQuickActionOpen) {
      return (
        <ChatBotQuickActions
          categories={quickActionCategories}
          actions={getQuickActions(QUICK_ACTION_CONFIGS)}
          onItemClick={onClickQuickAction}
          onSelectCategory={onSelectCategory}
          activeCategory={activeQuickActionCategory}
        />
      );
    }

    return messages.length > 0 ? (
      <ChatBot.MessageContainer
        messages={messages}
        isProcessing={isProcessing || isEmptyResponseMessage(messages[messages.length - 1])}
        processMessage={processMessage}
        renderMessage={({ message, isLastMessage }) =>
          message.role === 'assistant' ? (
            <div style={{ overflow: 'hidden' }}>
              {message.contentWithCitations ? (
                <AssistantCitationsMessage message={message} />
              ) : (
                <ChatBot.AssistantMessage message={message} markdownPlugins={[remarkOutlineBlock]} />
              )}
              <ChatBot.ReferenceSources messageId={message.id} referenceUrls={referenceUrls} />
              {(lastAssisantMessageRef || message.isOldMessage) && isLastMessage && !isFeedbackHidden && (
                <ChatBot.Feedback
                  messageRef={lastAssisantMessageRef}
                  reasons={editorChatbotFeedbackReasons}
                  onSubmitFeedback={({ feedbackType, content }: SubmitFeedbackType) =>
                    onSubmitEditorChatbotFeedback({ feedbackType, content, toolCalling: latestToolCall })
                  }
                />
              )}
            </div>
          ) : (
            <ChatBot.UserMessage message={message} />
          )
        }
      />
    ) : (
      <WelcomeScreen />
    );
  };

  const renderChatScreen = () => (
    <motion.div
      key="chatbot"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={styles.animateWrapper}
    >
      <ChatBot.Content>
        {renderContent()}
        {isShowPopUpRefresh ? (
          <ChatBot.WarningPopup
            onClick={handleRefreshDocument}
            icon="ph-wrench"
            message={t('viewer.chatbot.documentValid.warningMessage')}
            buttonTitle={t('viewer.chatbot.documentValid.refresh')}
          />
        ) : (
          <>
            <div className={styles.suggestPromptContainer}>
              <ChatBot.Input
                inputPromptRef={inputPromptRef}
                setValueState={setInput}
                onSubmit={handleSendMessage}
                disabledSubmit={
                  (!input && status === 'ready') || status === 'streaming' || isProcessing || isValidateDocument
                }
                isProcessing={isProcessing}
                placeholder={t('viewer.chatbot.placeholder')}
                stop={stop}
                stopCallback={stopCallback}
                chatSessionId={chatSessionId}
                AIMode={AIMode}
                modes={modes}
                enabledFileUpload
                enabledSwitchMode
              />
            </div>
            <ChatBot.Disclaimer message={t('viewer.chatbot.disclaimer')} />
          </>
        )}
      </ChatBot.Content>
    </motion.div>
  );

  return (
    <ChatBot>
      <ChatBot.Header
        leftSection={
          isQuickActionOpen ? (
            <ChatBotQuickActions.Header onBack={() => setIsQuickActionOpen(false)} />
          ) : (
            <DefaultChatBotTitle />
          )
        }
        menuItems={menuItems}
        onClose={onClose}
      />
      <div className={styles.animateBackground}>
        <AnimatePresence mode="wait">{renderChatScreen()}</AnimatePresence>
      </div>
    </ChatBot>
  );
};
