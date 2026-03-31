import React, { useEffect, useRef } from 'react';

import fireEvent from 'helpers/fireEvent';

import SharedAssistantMessageLayout from 'features/AIChatBot/components/ChatBotMessages/SharedAssistantMessageLayout';
import { CustomMessageType } from 'features/AIChatBot/interface';

import { CUSTOM_EVENT } from 'constants/customEvent';

import CitationMessage from './CitationMessage';
import { remarkCitationsSource } from '../markdown-plugins/remarkCitationsSource';

const AssistantCitationsMessage = ({ message }: { message: CustomMessageType }) => {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message.contentWithCitations?.length) {
      fireEvent(CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED, { ref: messageRef.current, messageId: message.id });
    }
  }, [message.id, message.contentWithCitations]);

  return (
    <SharedAssistantMessageLayout
      id={message.id}
      animated
      message={message}
      markdownPlugins={[remarkCitationsSource]}
      components={{
        div: CitationMessage,
      }}
      messageRef={messageRef}
      content={message.contentWithCitations}
    />
  );
};
export default AssistantCitationsMessage;
