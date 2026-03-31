import { Message } from '@ai-sdk/react';
import classNames from 'classnames';
import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { PluggableList } from 'react-markdown/lib';

import styles from './ChatBotMessages.module.scss';

type SharedAssistantMessageLayoutProps = {
  animated: boolean;
  message: Message & { isOldMessage?: boolean };
  markdownPlugins: PluggableList;
  components: Components;
  messageRef: React.RefObject<HTMLDivElement>;
  content: string;
  id: string;
};

const SharedAssistantMessageLayout = ({
  animated,
  markdownPlugins = [],
  components = {},
  messageRef,
  content,
  id,
}: SharedAssistantMessageLayoutProps) => (
  <div id={id} data-animated={animated} className={classNames(styles.messageGroup, styles.aiMessage)}>
    <div className={styles.message} ref={messageRef}>
      <ReactMarkdown components={{ ...components }} remarkPlugins={[...markdownPlugins]}>
        {content}
      </ReactMarkdown>
    </div>
  </div>
);

export default SharedAssistantMessageLayout;
