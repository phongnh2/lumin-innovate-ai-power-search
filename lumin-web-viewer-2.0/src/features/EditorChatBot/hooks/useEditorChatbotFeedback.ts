import { useSelector } from 'react-redux';

import { useLatestRef } from 'hooks/useLatestRef';

import { FEEDBACK_TYPE } from 'features/AIChatBot/constants';
import { useChatBotFeedback } from 'features/AIChatBot/hooks/useChatBotFeedback';
import { SubmitFeedbackType } from 'features/AIChatBot/interface';
import { selectors as chatBotFeedbackSelectors } from 'features/EditorChatBot/slices';

import { submitChatbotUserFeedBack } from '../apis';

export const useEditorChatbotFeedback = () => {
  const { callbackSubmitFeedback } = useChatBotFeedback();

  const storedMessages = useSelector(chatBotFeedbackSelectors.getMessages);
  const chatSessionId = useSelector(chatBotFeedbackSelectors.getChatSessionId);
  const { negativeFeedback, isHidden } = useSelector(chatBotFeedbackSelectors.getFeedbackStates);
  const latestNegativeFeedbacks = useLatestRef(negativeFeedback);
  const traceId = useSelector(chatBotFeedbackSelectors.getLatestTraceId);

  const commonFeedbackEventTracking = {
    sessionId: chatSessionId,
    survey: 'viewerChatbotResponse',
    responseId: storedMessages[storedMessages.length - 1]?.id,
  };

  const getFeedbackEventTracking = ({ feedbackType, content }: SubmitFeedbackType) => {
    if (feedbackType === FEEDBACK_TYPE.LIKE) {
      return {
        ...commonFeedbackEventTracking,
        answer: 'Like',
        answerPosition: null,
        feedback: null,
      };
    }

    return {
      ...commonFeedbackEventTracking,
      answer: 'Dislike',
      answerPosition: latestNegativeFeedbacks.current.reason,
      feedback: content,
    };
  };

  const onSubmit = async ({ feedbackType, content, toolCalling }: SubmitFeedbackType) => {
    await callbackSubmitFeedback({
      ...commonFeedbackEventTracking,
      toolName: toolCalling,
      ...getFeedbackEventTracking({ feedbackType, content }),
    });
    await submitChatbotUserFeedBack({
      traceId,
      feedback: {
        feedbackType,
        content,
        reason: latestNegativeFeedbacks.current.reason,
      },
    });
  };

  return { onSubmitEditorChatbotFeedback: onSubmit, isFeedbackHidden: isHidden };
};
