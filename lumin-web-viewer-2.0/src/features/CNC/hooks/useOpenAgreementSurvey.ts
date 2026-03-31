import { useRef, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import usePersonalDocPathMatch from 'hooks/usePersonalDocPathMatch';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { LocalStorageKey } from 'constants/localStorageKey';

import { useAgreementSectionStore } from './useAgreementSectionStore';
import { useGetAgreementGenSurveyFlag } from './useGetAgreementGenSurveyFlag';

const useOpenAgreementSurvey = () => {
  const {
    isOpenAgreementSurvey,
    setIsOpenAgreementSurvey,
    isOpenAgreementThankYouMessage,
    setIsOpenAgreementThankYouMessage,
    isOpenAgreementPromptModal,
  } = useAgreementSectionStore();
  const { isVisible } = useChatbotStore();
  const isPersonalDocumentsRoute = usePersonalDocPathMatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasShownAgreementSurvey, setHasShownAgreementSurvey] = useState(
    () => localStorage.getItem(LocalStorageKey.SHOW_AGREEMENT_GEN_SURVEY) === 'true'
  );
  const openUploadingPopper = useSelector(selectors.isOpenUploadingPopper);
  const { enabled } = useGetAgreementGenSurveyFlag();

  const onCloseAgreementSurvey = () => {
    localStorage.setItem(LocalStorageKey.SHOW_AGREEMENT_GEN_SURVEY, 'true');
    setHasShownAgreementSurvey(true);
    setIsOpenAgreementSurvey(false);
  };
  const onOpenAgreementSurvey = () => setIsOpenAgreementSurvey(true);

  const onOpenThankYouMessage = () => {
    setIsOpenAgreementThankYouMessage(true);
    timeoutRef.current = setTimeout(() => {
      setIsOpenAgreementThankYouMessage(false);
    }, 5000);
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const shouldShowAgreementSurvey = useMemo(
    () =>
      !isVisible &&
      isOpenAgreementSurvey &&
      isPersonalDocumentsRoute &&
      !hasShownAgreementSurvey &&
      !openUploadingPopper &&
      enabled,
    [isVisible, isOpenAgreementSurvey, isPersonalDocumentsRoute, hasShownAgreementSurvey, openUploadingPopper, enabled]
  );

  return {
    isOpenAgreementThankYouMessage,
    isOpenAgreementSurvey: shouldShowAgreementSurvey,
    isOpenAgreementPromptModal,
    onOpenThankYouMessage,
    onCloseAgreementSurvey,
    onOpenAgreementSurvey,
  };
};

export { useOpenAgreementSurvey };
