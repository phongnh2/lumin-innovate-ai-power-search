import { useState, useEffect, useCallback, useRef } from 'react';

export const useChatbotInputObservation = <T = unknown>(
  onInputAvailable?: (action: T) => void
): [boolean, (action: T) => void] => {
  const [isChatbotInputPresent, setIsChatbotInputPresent] = useState(false);
  const pendingActionRef = useRef<T | null>(null);

  useEffect(() => {
    const checkForChatbotInput = () => {
      const chatbotInput = document.getElementById('chatBotInput');
      setIsChatbotInputPresent(chatbotInput !== null);
    };

    checkForChatbotInput();
    const mutationObserver = new MutationObserver(checkForChatbotInput);

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isChatbotInputPresent && pendingActionRef.current && onInputAvailable) {
      onInputAvailable(pendingActionRef.current);
      pendingActionRef.current = null;
    }
  }, [isChatbotInputPresent, onInputAvailable]);

  const setPendingAction = useCallback((action: T) => {
    pendingActionRef.current = action;
  }, []);

  return [isChatbotInputPresent, setPendingAction];
};
