import { Chip, Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React, { useState, useMemo } from 'react';

import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks/useTranslation';

import { ReferenceUrlType } from 'features/AIChatBot/interface';

import styles from './ChatBotReferenceSources.module.scss';

interface ChatBotReferenceSourcesProps {
  messageId: string;
  referenceUrls: ReferenceUrlType[];
}

const ChatBotReferenceSources = ({ messageId, referenceUrls }: ChatBotReferenceSourcesProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentReferenceUrls = useMemo(
    () => referenceUrls.filter(({ messageId: referenceMessageId }) => messageId === referenceMessageId),
    [referenceUrls, messageId]
  );

  if (!currentReferenceUrls.length) {
    return null;
  }

  return (
    <div className={styles.referenceSources}>
      <Chip
        rounded
        w="fit-content"
        label={t('viewer.chatbot.showSource')}
        enablePointerEvents
        rightIcon={<Icomoon type={isExpanded ? 'ph-caret-up' : 'ph-caret-down'} />}
        onClick={() => setIsExpanded(!isExpanded)}
      />
      {isExpanded &&
        currentReferenceUrls.map(({ url, title, domain, description }) => (
          <a key={url} className={styles.sourceItem} href={url} target="_blank" rel="noopener noreferrer">
            <div className={styles.header}>
              <SvgElement className={styles.logo} content="logo-lumin-small" width={16} height={16} />
              <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
                {domain}
              </Text>
            </div>
            <Text
              size="xs"
              type="title"
              data-lines={1}
              className={styles.content}
              color="var(--kiwi-colors-surface-on-surface)"
            >
              {title}
            </Text>
            <Text
              size="sm"
              type="body"
              data-lines={2}
              className={styles.content}
              color="var(--kiwi-colors-surface-on-surface-low)"
            >
              {description}
            </Text>
          </a>
        ))}
    </div>
  );
};

export default ChatBotReferenceSources;
