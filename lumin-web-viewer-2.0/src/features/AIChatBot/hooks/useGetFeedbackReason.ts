import { useTranslation } from 'hooks/useTranslation';

import { CHATBOT_FEEDBACK_REASONS } from '../constants';
import { ChatBotFeedbackReasonType } from '../interface';

export const useGetFeedbackReason = () => {
  const { t } = useTranslation();
  const editorChatbotFeedbackReasons: ChatBotFeedbackReasonType[] = [
    {
      key: CHATBOT_FEEDBACK_REASONS.UI_BUG,
      label: t('viewer.chatbot.feedback.negative.uiBug'),
      value: 'UI bug',
    },
    {
      key: CHATBOT_FEEDBACK_REASONS.HARMFUL_CONTENT,
      label: t('viewer.chatbot.feedback.negative.harmfulContent'),
      value: 'Harmful content',
    },
    {
      key: CHATBOT_FEEDBACK_REASONS.OVERACTIVE_REFUSAL,
      label: t('viewer.chatbot.feedback.negative.overactiveRefusal'),
      value: 'Overactive refusal',
    },
    {
      key: CHATBOT_FEEDBACK_REASONS.MISUNDERSTOOD_REQUEST,
      label: t('viewer.chatbot.feedback.negative.misunderstoodRequest'),
      value: 'Misunderstood my request',
    },
    {
      key: CHATBOT_FEEDBACK_REASONS.NOT_FACTUALLY_CORRECT,
      label: t('viewer.chatbot.feedback.negative.notFactuallyCorrect'),
      value: 'Not factually correct',
    },
    {
      key: CHATBOT_FEEDBACK_REASONS.INCOMPLETE_RESPONSE,
      label: t('viewer.chatbot.feedback.negative.incompleteResponse'),
      value: 'Incomplete response',
    },
    {
      key: CHATBOT_FEEDBACK_REASONS.OTHER,
      label: t('viewer.chatbot.feedback.negative.other'),
      value: 'Other',
    },
  ];

  return { editorChatbotFeedbackReasons };
};
