import { useSelector } from 'react-redux';
import { useShallow } from 'zustand/react/shallow';

import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';
import { selectors } from 'features/EditorChatBot/slices';
import { hasResponseFromChatbot } from 'features/EditorChatBot/utils/checkResponseChatbot';

interface UseSubmitHandlerProps {
  onSubmit?: () => void;
  disabledSubmit?: boolean;
  isProcessing?: boolean;
  stop?: () => void;
  stopCallback?: () => void;
  isUploadingFiles?: boolean;
}

export const useSubmitHandler = ({
  onSubmit,
  disabledSubmit,
  isProcessing,
  stop,
  stopCallback,
  isUploadingFiles,
}: UseSubmitHandlerProps) => {
  const messages = useSelector(selectors.getMessages);
  const { setNeedToUpload, hasStartChatbotSession } = useChatbotStore(
    useShallow((state) => ({
      setNeedToUpload: state.setNeedToUpload,
      hasStartChatbotSession: state.hasStartChatbotSession,
    }))
  );

  const handleSubmit = () => {
    if (onSubmit && !disabledSubmit && !isProcessing && !isUploadingFiles) {
      onSubmit();
    }
  };

  const cancelRequest = () => {
    const hasChatbotResponse = hasResponseFromChatbot(messages);
    if (!hasChatbotResponse && hasStartChatbotSession) {
      setNeedToUpload(true);
    }
    if (isProcessing) {
      stop?.();
      stopCallback?.();
    }
  };

  return {
    handleSubmit,
    cancelRequest,
  };
};