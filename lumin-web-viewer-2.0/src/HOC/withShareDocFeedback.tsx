import React, { useCallback, useMemo, useState } from 'react';

import { useEnableShareDocFeedback } from 'hooks/useEnableShareDocFeedback';

import FeedbackContent from 'features/Feedback/components/FeedbackContent/FeedbackContent';
import FeedbackProvider from 'features/Feedback/components/FeedbackProvider/FeedbackProvider';

import { LocalStorageKey } from 'constants/localStorageKey';

const MAX_CLOSE_COUNT = 4;

const withShareDocFeedback =
  (Component: React.ComponentType<{ isEnableShareDocFeedback: boolean; openShareModal: boolean }>) =>
  (props: { onClose: () => void } & Record<string, unknown>) => {
    const { onClose } = props;
    const [openShareModal, setOpenShareModal] = useState(true);
    const { isEnableShareDocFeedback } = useEnableShareDocFeedback();
    const handleClose = useCallback(() => {
      onClose();
      const closeCount = Number(localStorage.getItem(LocalStorageKey.SHARE_DOC_FEEDBACK_MODAL_CLOSE_COUNT)) || 0;

      localStorage.setItem(LocalStorageKey.SHARE_DOC_FEEDBACK_MODAL_CLOSE_COUNT, String(closeCount + 1));
    }, [onClose]);

    const isShowFeedback = useMemo(() => {
      const closeCount = localStorage.getItem(LocalStorageKey.SHARE_DOC_FEEDBACK_MODAL_CLOSE_COUNT) || 0;

      return isEnableShareDocFeedback && Number(closeCount) < MAX_CLOSE_COUNT;
    }, [isEnableShareDocFeedback]);

    const onSubmitSuccess = () => {
      localStorage.setItem(LocalStorageKey.SHARE_DOC_FEEDBACK_MODAL_CLOSE_COUNT, String(MAX_CLOSE_COUNT));
    };

    return (
      <FeedbackProvider onClose={handleClose} onSubmitSuccess={onSubmitSuccess} onOpen={() => setOpenShareModal(false)}>
        <FeedbackContent />
        <Component isEnableShareDocFeedback={isShowFeedback} openShareModal={openShareModal} {...props} />
      </FeedbackProvider>
    );
  };

export default withShareDocFeedback;
