import { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import toastUtils from '@new-ui/utils/toastUtils';

import { useTranslation } from 'hooks/useTranslation';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { eventTracking } from 'utils/recordUtil';

import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';
import { setChatId, setChatSessionId, setMessages as setMessagesRedux } from 'features/EditorChatBot/slices';

import UserEventConstants from 'constants/eventConstants';

import { ChatBotContext } from '../components/ChatBotContext';
import {
  closeFeedbackModal,
  openFeedbackModal,
  feedbackModalSelectors,
} from '../components/ChatBotMenu/components/FeedbackModal/slices';
import { AIChatBotSurveyName } from '../constants/event';

export const useChatbotMenu = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [openMenu, setOpenMenu] = useState(false);
  const [feedbackValue, setFeedbackValue] = useState('');
  const { isQuickActionOpen, setIsQuickActionOpen } = useChatbotStore();
  const { setMessages, isProcessing, isMessageAnimated, messages } = useContext(ChatBotContext);
  const isOpenFeedbackModal = useSelector(feedbackModalSelectors.isOpenFeedbackModal);

  const onClickSendFeedback = () => {
    dispatch(openFeedbackModal());
    setOpenMenu(false);
  };

  const onClearChat = () => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: ButtonName.EDITOR_CHATBOT_CLEAR_HISTORY,
      elementPurpose: ButtonPurpose[ButtonName.EDITOR_CHATBOT_CLEAR_HISTORY],
    }).catch(() => {});
    setMessages([]);
    dispatch(setChatSessionId(null));
    dispatch(setMessagesRedux([]));
    dispatch(setChatId(null));
    setOpenMenu(false);
  };

  const onConfirmFeedback = () => {
    dispatch(closeFeedbackModal());
    setFeedbackValue('');
    toastUtils.success({
      title: t('viewer.chatbot.menu.toast.thank'),
      message: t('viewer.chatbot.menu.toast.message'),
      duration: 3000,
    });
    eventTracking(UserEventConstants.EventType.SURVEY_RESPONSE, {
      survey: AIChatBotSurveyName.EDITOR_CHATBOT_EXPERIENCE,
      feedback: feedbackValue,
    }).catch(() => {});
  };

  const onCloseFeedback = () => {
    dispatch(closeFeedbackModal());
    setFeedbackValue('');
  };

  const menuItems = [
    {
      label: t('viewer.chatbot.menu.whatLuminAIcanDo'),
      key: 'whatLuminAIcanDo',
      icon: 'ph-magic-wand',
      onClick: () => setIsQuickActionOpen(true),
      'data-lumin-btn-name': 'whatLuminAICanDo',
      'data-lumin-btn-purpose': 'Select What Lumin AI can do option',
    },
    {
      label: t('common.sendFeedback'),
      key: 'sendFeedback',
      icon: 'ph-paper-plane-tilt',
      onClick: onClickSendFeedback,
      'data-lumin-btn-name': 'sendFeedback',
      'data-lumin-btn-purpose': 'Select Send Feedback option',
    },
    {
      label: t('viewer.chatbot.menu.clearChat'),
      key: 'clearChat',
      icon: 'ph-trash-simple',
      color: '--kiwi-colors-semantic-error',
      onClick: onClearChat,
      disabled: isProcessing || (!isMessageAnimated && messages.length > 0),
      'data-lumin-btn-name': 'clearChat',
      'data-lumin-btn-purpose': 'Select Clear Chat option',
    },
  ];

  return {
    openFeedbackModal: isOpenFeedbackModal,
    openMenu,
    setOpenMenu,
    feedbackValue,
    setFeedbackValue,
    menuItems,
    onCloseFeedback,
    onConfirmFeedback,
    onClearChat,
    onClickSendFeedback,
    isQuickActionOpen,
    setIsQuickActionOpen,
  };
};
