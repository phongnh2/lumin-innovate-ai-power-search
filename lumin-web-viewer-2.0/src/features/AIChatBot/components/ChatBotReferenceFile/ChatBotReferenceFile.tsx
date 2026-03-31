import { Button, Text, Collapse, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'hooks';

import { SourcePartType } from 'features/AIChatBot/interface';

import styles from './ChatBotReferenceFile.module.scss';

type ChatBotReferenceFileProps = {
  messageId: string;
  referenceFiles: SourcePartType[];
};

const ChatBotReferenceFile = ({ messageId, referenceFiles }: ChatBotReferenceFileProps) => {
  const { t } = useTranslation();

  const currentReferenceFiles = useMemo(
    () => referenceFiles.filter(({ messageId: referenceMessageId }) => messageId === referenceMessageId),
    [referenceFiles, messageId]
  );

  const referenceFileRef = useRef<HTMLDivElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const isResultType = useMemo(
    () => currentReferenceFiles.some((file) => file.providerMetadata?.sourceInfo?.isResult),
    [currentReferenceFiles]
  );

  useEffect(() => {
    if (isResultType) {
      setIsCollapsed(false);
    }
  }, [isResultType]);

  useEffect(() => {
    if (referenceFileRef.current) {
      requestAnimationFrame(() => {
        referenceFileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }, [isCollapsed]);

  if (!currentReferenceFiles.length) {
    return null;
  }

  return (
    <div className={styles.referenceFileWrapper} ref={referenceFileRef}>
      <Button
        variant="text"
        size="md"
        colorType="info"
        startIcon={<Icomoon type={isCollapsed ? 'ph-caret-down' : 'ph-caret-up'} />}
        className={styles.referenceFileButton}
        onClick={(e) => {
          e.stopPropagation();
          setIsCollapsed(!isCollapsed);
        }}
      >
        {`${t(isResultType ? 'common.results' : 'common.sources')} (${currentReferenceFiles.length})`}
      </Button>
      <Collapse in={!isCollapsed}>
        <div className={styles.referenceFileContainer}>
          {currentReferenceFiles.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.referenceFileItem}
            >
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
                {file.title || file.url}
              </Text>
            </a>
          ))}
        </div>
      </Collapse>
    </div>
  );
};

export default ChatBotReferenceFile;
