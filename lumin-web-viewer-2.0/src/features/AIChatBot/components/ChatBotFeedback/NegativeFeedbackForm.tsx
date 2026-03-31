import { Button, Chip, IconButton, Text, Textarea } from 'lumin-ui/kiwi-ui';
import { motion } from 'motion/react';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { useCleanup } from 'hooks/useCleanup';
import { useLatestRef } from 'hooks/useLatestRef';
import { useTranslation } from 'hooks/useTranslation';

import { CHATBOT_FEEDBACK_DESCRIPTION_MAX_LENGTH } from 'features/AIChatBot/constants';
import { useChatBotFeedback } from 'features/AIChatBot/hooks/useChatBotFeedback';
import { ChatBotFeedbackReasonType } from 'features/AIChatBot/interface';
import { setNegativeFeedback } from 'features/EditorChatBot/slices';

import { CUSTOM_EVENT } from 'constants/customEvent';

import styles from './NegativeFeedbackForm.module.scss';

interface NegativeFeedbackFormProps {
  reasons: ChatBotFeedbackReasonType[];
  onSubmitFeedback: (feedbackContent: string) => void;
}

const NegativeFeedbackForm = ({ reasons, onSubmitFeedback }: NegativeFeedbackFormProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { feedbackContent, negativeFeedback, setFeedbackContent, onSelectReason, onCloseFeedbackForm } =
    useChatBotFeedback();
  const isAutoSubmitRef = useRef(false);
  const feedbackContentRef = useLatestRef(feedbackContent);

  useEffect(() => {
    const onAutoSubmitFeedback = () => {
      if (!feedbackContentRef.current) {
        return;
      }
      isAutoSubmitRef.current = true;
      onSubmitFeedback(feedbackContentRef.current);
    };
    window.addEventListener(CUSTOM_EVENT.AUTO_SUBMIT_CHATBOT_FEEDBACK, onAutoSubmitFeedback);

    return () => {
      window.removeEventListener(CUSTOM_EVENT.AUTO_SUBMIT_CHATBOT_FEEDBACK, onAutoSubmitFeedback);
    };
  }, []);

  useCleanup(() => {
    if (!isAutoSubmitRef.current) {
      dispatch(setNegativeFeedback({ content: feedbackContentRef.current }));
    }
  }, []);

  return (
    <motion.div
      key="negative-feedback"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25 }}
      className={styles.wrapper}
    >
      <div className={styles.form}>
        <div className={styles.header}>
          <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
            {t('viewer.chatbot.feedback.negative.title')}
          </Text>
          <IconButton icon="ph-x" size="sm" onClick={onCloseFeedbackForm} />
        </div>
        <div className={styles.reasons}>
          {reasons.map((reason) => (
            <Chip
              key={reason.key}
              rounded
              size="sm"
              enablePointerEvents
              label={reason.label}
              onClick={() => onSelectReason(reason.value)}
              colorType={negativeFeedback.reason === reason.value ? 'blue' : 'grey'}
            />
          ))}
        </div>
        <div className={styles.textArea}>
          <Textarea
            maxLength={CHATBOT_FEEDBACK_DESCRIPTION_MAX_LENGTH}
            onChange={(e) => setFeedbackContent(e.target.value)}
            value={feedbackContent}
          />
          <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
            {feedbackContent.length}/{CHATBOT_FEEDBACK_DESCRIPTION_MAX_LENGTH}
          </Text>
        </div>
        <Button
          disabled={!negativeFeedback.reason && !feedbackContent}
          onClick={() => onSubmitFeedback(feedbackContentRef.current)}
        >
          {t('action.submit')}
        </Button>
      </div>
    </motion.div>
  );
};

export default NegativeFeedbackForm;
