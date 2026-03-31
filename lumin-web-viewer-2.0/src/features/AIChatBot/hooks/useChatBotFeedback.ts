import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

import { eventTracking } from 'utils';

import {
  selectors as chatBotFeedbackSelectors,
  resetFeedbackState,
  setFeedbackType,
  setIsSubmittedFeedback,
  setNegativeFeedback,
} from 'features/EditorChatBot/slices';

import UserEventConstants from 'constants/eventConstants';

import { FEEDBACK_TYPE } from '../constants';
import { ChatBotFeedbackTrackingType, FeedbackType } from '../interface';

export const useChatBotFeedback = () => {
  const dispatch = useDispatch();
  const { feedbackType, negativeFeedback, isSubmitted } = useSelector(chatBotFeedbackSelectors.getFeedbackStates);

  const [showThankyouMessage, setShowThankyouMessage] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState(negativeFeedback.content || '');

  const onSelectReason = (reason: string) => {
    dispatch(setNegativeFeedback({ reason: negativeFeedback.reason !== reason ? reason : null }));
  };

  const onCloseThankYouMessage = () => {
    setShowThankyouMessage(false);
  };

  const debounceAutoCloseThankYouMessage = useDebouncedCallback(onCloseThankYouMessage, 3000);

  const onShowThankyouMessage = () => {
    setShowThankyouMessage(true);
    debounceAutoCloseThankYouMessage();
  };

  const onCloseFeedbackForm = () => {
    dispatch(setNegativeFeedback({ isFormOpen: false }));
  };

  const onResetFeedbackStates = () => {
    dispatch(resetFeedbackState());
  };

  const { isLoading: isSubmitting, mutateAsync: onSubmitFeedback } = useMutation({
    mutationKey: ['submitChatbotFeedback'],
    mutationFn: async (eventTrackingData: ChatBotFeedbackTrackingType) => {
      dispatch(setIsSubmittedFeedback(true));
      dispatch(setNegativeFeedback({ isFormOpen: false }));
      await eventTracking(UserEventConstants.EventType.SURVEY_RESPONSE, eventTrackingData);
    },
  });

  const handlePositiveFeedback = () => {
    dispatch(setFeedbackType(FEEDBACK_TYPE.LIKE));
    onCloseFeedbackForm();
    onShowThankyouMessage();
  };

  const handleNegativeFeedback = () => {
    if (feedbackType === FEEDBACK_TYPE.DISLIKE) {
      dispatch(setFeedbackType(FEEDBACK_TYPE.NONE));
      dispatch(setNegativeFeedback({ isFormOpen: false }));
      return;
    }
    dispatch(setFeedbackType(FEEDBACK_TYPE.DISLIKE));
    dispatch(setNegativeFeedback({ isFormOpen: true }));
  };

  const onClickThumbButton = (action: FeedbackType) => {
    if (action === FEEDBACK_TYPE.LIKE) {
      handlePositiveFeedback();
      return;
    }
    handleNegativeFeedback();
  };

  return {
    feedbackType,
    negativeFeedback,
    feedbackContent,
    showThankyouMessage,
    disabledClickThumb: isSubmitting || isSubmitted,
    onSelectReason,
    setFeedbackContent,
    onShowThankyouMessage,
    onCloseThankYouMessage,
    onCloseFeedbackForm,
    callbackSubmitFeedback: onSubmitFeedback,
    callbackClickThumbButton: onClickThumbButton,
    callbackResetFeedbackStates: onResetFeedbackStates,
  };
};
