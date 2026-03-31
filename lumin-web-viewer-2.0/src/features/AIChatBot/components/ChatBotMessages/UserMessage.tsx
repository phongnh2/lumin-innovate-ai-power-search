import { Message } from '@ai-sdk/react';
import classNames from 'classnames';
import { Chip, Icomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { getTruncatedFileName } from 'utils/getTruncatedFileName';

import { useGetFilesByUserMessage } from 'features/AIChatBot/hooks/useGetFilesByUserMessage';

import styles from './ChatBotMessages.module.scss';

const UserMessage = ({ message }: { message: Message }) => {
  const { attachedFiles } = useGetFilesByUserMessage({ message });

  return (
    <>
      {attachedFiles.length > 0 &&
        attachedFiles.map((file) => (
          <Chip
            key={file.id}
            rounded
            size="md"
            colorType="grey"
            className={styles.attachedFile}
            leftIcon={<Icomoon type="ph-file" size="md" />}
            label={getTruncatedFileName({
              filename: file.file.name,
              maxLength: 40,
              firstPart: 30,
              maxWidth: 336,
            })}
          />
        ))}
      <div key={message.id} id={message.id} className={classNames(styles.messageGroup, styles.userMessage)}>
        <div className={styles.message}>
          <p className={styles.messageContent}>{message.content}</p>
        </div>
      </div>
    </>
  );
};

export default UserMessage;
