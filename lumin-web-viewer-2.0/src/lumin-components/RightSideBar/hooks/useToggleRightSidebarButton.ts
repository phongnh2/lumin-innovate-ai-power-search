import { useCallback } from 'react';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';
import { RIGHT_PANEL_VALUES } from 'features/WebRightPanel/constants';

import { useRightPanelStore } from '../../../features/WebRightPanel/hooks/useRightPanelStore';

export const useToggleRightSidebarButton = () => {
  const { isVisible: isChatbotVisible, setIsVisible: setChatbotVisible, setIsClosedByUser } = useChatbotStore();

  const { activePanel, setActivePanel } = useRightPanelStore();

  const isInvoiceExtractorAppActived = activePanel === RIGHT_PANEL_VALUES.INVOICE_EXTRACTOR;
  const isTranslatorAppActived = activePanel === RIGHT_PANEL_VALUES.TRANSLATOR;
  const isResumeCheckerAppActived = activePanel === RIGHT_PANEL_VALUES.RESUME_CHECKER;

  const onCloseViewerApp = useCallback(() => {
    setActivePanel(null);
  }, [setActivePanel]);

  const onToggleChatbot = useCallback(() => {
    const willOpen = !isChatbotVisible;
    setChatbotVisible(willOpen);
    setIsClosedByUser(!willOpen);

    setActivePanel(willOpen ? RIGHT_PANEL_VALUES.CHATBOT : null);
  }, [isChatbotVisible, setChatbotVisible, setIsClosedByUser, setActivePanel]);

  const onToggleViewerApps = useCallback(
    (appLayoutElement: string) => {
      if (isChatbotVisible) {
        setChatbotVisible(false);
        setIsClosedByUser(true);
      }

      const isSameApp = activePanel === appLayoutElement;

      if (isSameApp) {
        setActivePanel(null);
      } else {
        setActivePanel(appLayoutElement as RIGHT_PANEL_VALUES);
      }
    },
    [isChatbotVisible, activePanel, setChatbotVisible, setIsClosedByUser, setActivePanel]
  );

  return {
    isChatbotVisible,
    isTranslatorAppActived,
    isResumeCheckerAppActived,
    isInvoiceExtractorAppActived,
    onCloseViewerApp,
    onToggleChatbot,
    onToggleViewerApps,
  };
};
