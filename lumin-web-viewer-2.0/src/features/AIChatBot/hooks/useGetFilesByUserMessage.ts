import { Message } from '@ai-sdk/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';
import { setMergeFiles } from 'features/EditorChatBot/slices';

import { ATTACHED_FILES_STATUS } from '../constants/attachedFiles';
import { AttachedFileType } from '../interface';

export const useGetFilesByUserMessage = ({ message }: { message: Message }) => {
  const { attachedFiles, setAttachedFiles } = useChatbotStore();
  const dispatch = useDispatch();

  const attachedFilesByMessageId = useMemo(
    () => attachedFiles.filter((file) => file.messageId === message.id),
    [attachedFiles, message.id]
  );
  const messageSentHandler = useCallback(() => {
    const extraFiles: AttachedFileType[] = [];
    const newAttachedFiles = attachedFiles.map((file) => {
      const isSentFiles = !file.messageId && file.status === ATTACHED_FILES_STATUS.UPLOADED;
      if (isSentFiles) {
        extraFiles.push({ ...file, messageId: message.id, status: ATTACHED_FILES_STATUS.SENT });
        return { ...file, messageId: message.id, status: ATTACHED_FILES_STATUS.SENT };
      }
      return file;
    });
    if (extraFiles.length > 0) {
      dispatch(setMergeFiles(extraFiles));
    }

    setAttachedFiles(newAttachedFiles);
  }, [attachedFiles]);

  useEffect(() => {
    if (attachedFiles.length > 0) {
      messageSentHandler();
    }
  }, []);

  return { attachedFiles: attachedFilesByMessageId };
};
