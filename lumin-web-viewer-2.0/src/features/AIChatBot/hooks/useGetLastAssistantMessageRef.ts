import { useEffect, useState } from 'react';

import { CUSTOM_EVENT } from 'constants/customEvent';

import { useChatBot } from './useChatBot';

export const useGetLastAssistantMessageRef = () => {
  const { messages } = useChatBot();
  const [lastAssisantMessageRef, setLastAssisantMessageRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const setMessageRef = (data: CustomEvent<{ ref: HTMLDivElement }>) => {
      setLastAssisantMessageRef(data.detail.ref);
    };
    window.addEventListener(CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED, setMessageRef);

    return () => {
      window.removeEventListener(CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED, setMessageRef);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0 && lastAssisantMessageRef) {
      setLastAssisantMessageRef(null);
    }
  }, [messages]);

  return { lastAssisantMessageRef };
};
