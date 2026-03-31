import React from 'react';

import { FeedbackContext } from 'features/Feedback/contexts';
import { useFeedbackHandler } from 'features/Feedback/hooks';

type SwitchLayoutProviderProps = {
  children: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  onSubmitSuccess?: () => void;
};

const FeedbackProvider = ({ children, onClose, onSubmitSuccess, onOpen }: SwitchLayoutProviderProps) => {
  const contextValues = useFeedbackHandler({
    onClose,
    onSubmitSuccess,
    onOpen,
  });

  return <FeedbackContext.Provider value={contextValues}>{children}</FeedbackContext.Provider>;
};

export default FeedbackProvider;
