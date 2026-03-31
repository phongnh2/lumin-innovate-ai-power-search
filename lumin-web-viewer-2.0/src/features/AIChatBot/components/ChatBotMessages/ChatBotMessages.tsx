import classNames from 'classnames';
import { ScrollArea, IconButton } from 'lumin-ui/kiwi-ui';
import rafSchd from 'raf-schd';
import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { CustomMessageType } from 'features/AIChatBot/interface';
import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';

import { getLastAssistantMessage, getLastUserMessage } from './utils';
import ProcessingMessage from '../ProcessingMessage';

import styles from './ChatBotMessages.module.scss';

interface ChatBotMessagesProps {
  messages: CustomMessageType[];
  isProcessing: boolean;
  renderMessage: ({
    message,
    isLastMessage,
  }: {
    message: CustomMessageType;
    isLastMessage: boolean;
  }) => React.ReactNode;
  processMessage: string;
}

const MARGIN_TOP = 8;
const SCROLL_BOTTOM_THRESHOLD = 10;

const ChatBotMessages: React.FC<ChatBotMessagesProps> = ({ messages, isProcessing, renderMessage, processMessage }) => {
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [blurRef, setBlurRef] = useState<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const lastAssistantMessageRef = useRef<HTMLDivElement>(null);

  // Tracks whether we allow auto-scroll while streaming to follow assistant message.
  const shouldFollowAssistantMessageRef = useRef(true);

  const { isUploadLargeDocument } = useChatbotStore(
    useShallow((state) => ({
      isUploadLargeDocument: state.isUploadLargeDocument,
    }))
  );

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current?.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    const lastUserMessage = getLastUserMessage(messages);
    const lastUserMessageElement = document.getElementById(lastUserMessage.id);
    if (lastUserMessageRef.current?.id !== lastUserMessage.id) {
      // When user send a message, allow to follow assistant message automatically.
      shouldFollowAssistantMessageRef.current = true;
      lastUserMessageRef.current = lastUserMessageElement as HTMLDivElement;
      // Use instant behavior for initial positioning
      lastUserMessageRef.current.scrollIntoView({ behavior: 'instant' });
    }
    const lastAssistantMessage = getLastAssistantMessage(messages);
    const lastAssistantMessageElement = document.getElementById(lastAssistantMessage?.id);
    if (lastAssistantMessageRef.current?.id !== lastAssistantMessage?.id) {
      lastAssistantMessageRef.current = lastAssistantMessageElement as HTMLDivElement;
    }
  }, [messages.length]);

  const getScrollContainer = () =>
    chatAreaRef.current?.closest(`[class*=${styles.chatViewport}]`) || chatAreaRef.current?.parentElement;

  // Hook to track user scroll intent - determines when to follow assistant messages
  useEffect(() => {
    const scrollContainer = getScrollContainer();

    if (!scrollContainer) {
      return undefined;
    }

    const onScroll = () => {
      const distanceFromBottom =
        scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;

      /**
       * If user is near the bottom while streaming, then keep follow mode ON.
       * If user manually scrolled away, then turn it OFF.
       */
      if (isProcessing && distanceFromBottom < SCROLL_BOTTOM_THRESHOLD) {
        shouldFollowAssistantMessageRef.current = true;
      } else {
        shouldFollowAssistantMessageRef.current = false;
      }
    };

    scrollContainer.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', onScroll);
    };
  }, [isProcessing]);

  // Hook to execute auto-scroll behavior - performs the actual scrolling when content changes
  useEffect(() => {
    const resizeCallback = rafSchd(() => {
      const lastAssistantMessageElement = lastAssistantMessageRef.current;
      const shouldFollowAssistantMessage = shouldFollowAssistantMessageRef.current;

      if (!shouldFollowAssistantMessage) {
        return;
      }

      // Use a more robust check for the animated attribute - check if it exists and is truthy
      const isAnimatedAssistantMessage =
        lastAssistantMessageElement?.hasAttribute('data-animated') &&
        lastAssistantMessageElement.getAttribute('data-animated') !== 'false';
      if (!isProcessing && isAnimatedAssistantMessage) {
        return;
      }
      if (lastUserMessageRef.current && chatAreaRef.current) {
        const scrollContainer = getScrollContainer();
        if (scrollContainer) {
          const elementTop = lastUserMessageRef.current.getBoundingClientRect().top;
          const containerTop = scrollContainer.getBoundingClientRect().top;
          const scrollTop = elementTop - containerTop - MARGIN_TOP;

          scrollContainer.scrollTo({
            top: scrollContainer.scrollTop + scrollTop,
            behavior: 'smooth',
          });
        }
      }
    });
    const observer = new ResizeObserver(resizeCallback);
    observer.observe(chatAreaRef.current);
    return () => {
      observer.disconnect();
    };
  }, [isProcessing]);

  useEffect(() => {
    if (blurRef) {
      const observer = new IntersectionObserver((entries) => {
        clearTimeout(timeoutIdRef.current);
        if (!entries[0].isIntersecting) {
          // Use timeout to prevent flash when assistant message is streaming
          timeoutIdRef.current = setTimeout(() => {
            setShowScrollToBottom(!entries[0].isIntersecting);
          }, 200);
          return;
        }
        setShowScrollToBottom(!entries[0].isIntersecting);
      });
      observer.observe(blurRef);

      return () => {
        clearTimeout(timeoutIdRef.current);
        observer.disconnect();
      };
    }
  }, [blurRef]);

  return (
    <div className={styles.chatArea}>
      <ScrollArea
        classNames={{
          viewport: styles.chatViewport,
        }}
        viewportRef={scrollRef}
      >
        <div className={styles.chatAreaScroll} ref={chatAreaRef}>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              {renderMessage({ message, isLastMessage: index === messages.length - 1 })}
            </React.Fragment>
          ))}
          {isProcessing && !isUploadLargeDocument && <ProcessingMessage content={processMessage} />}
          <div
            className={classNames(styles.bottomContainerBlur, !showScrollToBottom && styles.hideBottomContainerBlur)}
          />
          <IconButton
            icon="ph-caret-down"
            className={classNames(styles.scrollToBottomButton, !showScrollToBottom && styles.hideScrollToBottomButton)}
            size="md"
            variant="elevated"
            onClick={scrollToBottom}
          />
          <div
            ref={(ref) => {
              setBlurRef(ref);
            }}
            className={styles.blur}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatBotMessages;
