import classNames from 'classnames';
import { ButtonSize, Icomoon } from 'lumin-ui/kiwi-ui';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import CopyButton from 'ui/components/CopyButton';
import { CopyButtonType } from 'ui/components/CopyButton/constants';

import { FEEDBACK_TYPE } from 'features/AIChatBot/constants';
import { useChatBot } from 'features/AIChatBot/hooks/useChatBot';
import { useChatBotFeedback } from 'features/AIChatBot/hooks/useChatBotFeedback';
import useGetResponseAction from 'features/AIChatBot/hooks/useGetResponseAction';
import { ChatBotFeedbackReasonType, FeedbackType, SubmitFeedbackType } from 'features/AIChatBot/interface';
import splitExtract from 'features/EditorChatBot/ai/tools/splitExtract';
import { CHATBOT_TOOL_NAMES } from 'features/EditorChatBot/constants';

import NegativeFeedbackForm from './NegativeFeedbackForm';
import ThankYouMessage from './ThankYouMessage';
import { ThumbButton } from './ThumbButton';
import ResponseActions from '../ResponseActions';

import styles from './ChatBotFeedback.module.scss';

const ChatBotFeedback = ({
  reasons,
  messageRef,
  onSubmitFeedback,
}: {
  reasons: ChatBotFeedbackReasonType[];
  messageRef: HTMLDivElement;
  onSubmitFeedback: (data: SubmitFeedbackType) => void;
}) => {
  const {
    feedbackType,
    negativeFeedback,
    disabledClickThumb,
    showThankyouMessage,
    onCloseThankYouMessage,
    callbackClickThumbButton,
  } = useChatBotFeedback();
  const { t } = useTranslation();
  const { setInput, setTriggerSubmit, inputPromptRef } = useChatBot();
  const { isShowButtonAction, pagesToExtract, toolCalling } = useGetResponseAction();

  const onClickThumb = (type: FeedbackType) => {
    if (disabledClickThumb) {
      return;
    }
    if (type === FEEDBACK_TYPE.LIKE) {
      onSubmitFeedback({ feedbackType: type });
    }
    callbackClickThumbButton(type);
  };

  const renderFeedbackBottom = () => {
    switch (true) {
      case showThankyouMessage:
        return <ThankYouMessage onClose={onCloseThankYouMessage} />;
      case negativeFeedback.isFormOpen:
        return (
          <NegativeFeedbackForm
            reasons={reasons}
            onSubmitFeedback={(content: string) => onSubmitFeedback({ feedbackType: FEEDBACK_TYPE.DISLIKE, content })}
          />
        );
      default:
        return null;
    }
  };
  const reponseActions = {
    [CHATBOT_TOOL_NAMES.SPLIT_EXTRACT]: {
      label: t('viewer.chatbot.splitExtract.download'),
      icon: <Icomoon type="ph-list-plus" />,
      onClick: async () => {
        await splitExtract({ pagesToExtract });
      },
    },
    [CHATBOT_TOOL_NAMES.GENERATE_OUTLINES]: {
      label: t('viewer.chatbot.outlines.insertOutlines'),
      icon: <Icomoon type="ph-list-plus" />,
      onClick: () => {
        setInput(t('viewer.chatbot.outlines.insertOutlines'));
        setTriggerSubmit(true);
        inputPromptRef.current?.focus();
      },
    },
  };

  return (
    <div className={styles.feedbackWrapper}>
      <div className={classNames(styles.aiResponseActions, isShowButtonAction && styles.hasGeneratedButtonAction)}>
        {isShowButtonAction && reponseActions[toolCalling] && (
          <ResponseActions responseActions={reponseActions[toolCalling]} />
        )}
        <div className={styles.ctas}>
          <motion.div
            key="copy-feedback"
            initial={{ opacity: 0, transform: 'scale(0.8)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            exit={{ opacity: 0.5, transform: 'scale(0.8)' }}
            transition={{ duration: 0.25 }}
          >
            <CopyButton
              dataCy="copy-feedback"
              size={ButtonSize.md}
              type={CopyButtonType.SIMPLE}
              contentRef={messageRef}
            />
          </motion.div>
          <AnimatePresence mode="wait">
            <ThumbButton
              onClick={onClickThumb}
              type={FEEDBACK_TYPE.LIKE}
              isActive={feedbackType === FEEDBACK_TYPE.LIKE}
            />
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <ThumbButton
              onClick={onClickThumb}
              type={FEEDBACK_TYPE.DISLIKE}
              isActive={feedbackType === FEEDBACK_TYPE.DISLIKE}
            />
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence mode="popLayout">{renderFeedbackBottom()}</AnimatePresence>
    </div>
  );
};

export default ChatBotFeedback;
