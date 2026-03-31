import { useRef, useState } from 'react';
import { v4 } from 'uuid';

import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';

import { useAttachedFilesManipulation } from './useAttachedFilesManipulation';
import { useValidateAttachedFiles } from './useValidateAttachedFiles';
import { ATTACHED_FILES_STATUS } from '../constants/attachedFiles';
import {
  AttachedFilesSourceType,
  AttachedFileStatusType,
  AttachedFileType,
  HandleRemoveAttachedFileProps,
} from '../interface';

export const useUploadAttachedFiles = () => {
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const { attachedFiles, setAttachedFiles } = useChatbotStore();
  const { getValidatedFiles } = useValidateAttachedFiles(attachedFiles);
  const { loadAttachedFiles } = useAttachedFilesManipulation();

  const handleAddFiles = async ({
    files,
    source,
    status,
    chatSessionId,
  }: {
    files: (File & { remoteId?: string })[];
    source: AttachedFilesSourceType;
    status: AttachedFileStatusType;
    chatSessionId?: string;
  }) => {
    const uploadableFiles = getValidatedFiles(files);

    setIsUploadingFiles(true);
    const newFiles = [
      ...attachedFiles,
      ...uploadableFiles.map((file) => {
        const id = v4();
        const abortController = new AbortController();
        abortControllersRef.current.set(id, abortController);

        return {
          id,
          remoteId: file.remoteId,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          status,
          source,
          file,
        };
      }),
    ];

    setAttachedFiles(newFiles);

    await loadAttachedFiles({
      chatSessionId,
      attachedFiles: newFiles,
      abortControllers: abortControllersRef.current,
      setAttachedFiles,
      setIsUploadingFiles,
    });
  };

  const handleRemoveFiles = ({ removeId, fileIndex }: HandleRemoveAttachedFileProps) => {
    const controller = abortControllersRef.current.get(removeId);
    if (controller) {
      controller.abort('Uploading file has been removed');
      abortControllersRef.current.delete(removeId);
    }

    const { sentFiles, uploadingFiles }: { sentFiles: AttachedFileType[]; uploadingFiles: AttachedFileType[] } =
      attachedFiles.reduce(
        (acc, file) => {
          if (file.status === ATTACHED_FILES_STATUS.SENT) {
            acc.sentFiles.push(file);
          } else {
            acc.uploadingFiles.push(file);
          }
          return acc;
        },
        { sentFiles: [], uploadingFiles: [] }
      );

    setAttachedFiles([
      ...sentFiles,
      ...uploadingFiles.filter((file, idx) => file.id !== removeId && idx !== fileIndex),
    ]);
  };

  return {
    attachedFiles,
    isUploadingFiles,
    handleAddFiles,
    handleRemoveFiles,
  };
};
