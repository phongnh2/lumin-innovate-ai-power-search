import { Message } from '@ai-sdk/react';
import React, { useEffect, useRef } from 'react';
import { PluggableList } from 'react-markdown/lib';

import fireEvent from 'helpers/fireEvent';

import { useAnimatedText } from 'features/AIChatBot/hooks/useAnimateText';

import { CUSTOM_EVENT } from 'constants/customEvent';

import SharedAssistantMessageLayout from './SharedAssistantMessageLayout';
import { stripMarkdownLinks } from './utils';

import styles from './ChatBotMessages.module.scss';
// Define the link component outside of the render function
const MarkdownLink = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  <a className={styles.link} target="_blank" rel="noopener noreferrer" {...props} />
);

type AssistantMessageProps = {
  message: Message & { isOldMessage?: boolean };
  markdownPlugins?: PluggableList;
};

const AssistantMessage = ({ message, markdownPlugins = [] }: AssistantMessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const {
    text: animatedText,
    animated,
    isAnimatingText,
  } = useAnimatedText(stripMarkdownLinks(message.content), message.id);
  const content = message.isOldMessage || animated ? message.content : animatedText;

  useEffect(() => {
    if (content.length && !isAnimatingText) {
      fireEvent(CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED, { ref: messageRef.current, messageId: message.id });
    }
  }, [isAnimatingText, content]);

  useEffect(() => {
    if (!isAnimatingText && animated && content.length) {
      fireEvent(CUSTOM_EVENT.CHATBOT_ASSISTANT_MESSAGE_ANIMATED_END, {
        message,
      });
    }
  }, [animated, isAnimatingText, content, message]);

  return (
    message.content && (
      <SharedAssistantMessageLayout
        key={message.id}
        id={message.id}
        animated={animated}
        message={message}
        markdownPlugins={markdownPlugins}
        components={{
          a: MarkdownLink,
        }}
        messageRef={messageRef}
        content={content}
      />
    )
  );
};

export default AssistantMessage;
