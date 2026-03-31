import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import core from 'core';

import { selectors as chatBotFeedbackSelectors } from 'features/EditorChatBot/slices';
import { useSyncedQueueContext } from 'features/FileSync';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';

const useTextContentUpdated = () => {
  const { setQueue } = useSyncedQueueContext();
  useEffect(() => {
    const onTextContentUpdated = () => {
      const actionId = `${AUTO_SYNC_CHANGE_TYPE.CONTENT_CHANGE}:${uuidv4()}`;
      setQueue((queue) => [...queue, actionId]);
    };
    window.Core.ContentEdit.addEventListener('textContentUpdated', onTextContentUpdated);
    return () => {
      window.Core.ContentEdit.removeEventListener('textContentUpdated', onTextContentUpdated);
    };
  }, [setQueue]);
};

export function useDisabledHeaderButton() {
  const [disabledDoneBtn, setDisabledDoneBtn] = useState(false);
  const [disabledDiscardBtn, setDisabledDiscardBtn] = useState(true);
  const isProcessingInEditMode = useSelector(chatBotFeedbackSelectors.getIsAiProcessing);

  const contentBoxEditStarted = () => {
    setDisabledDoneBtn(true);
    setDisabledDiscardBtn(true);
  };

  const contentBoxEditEnded = () => {
    const isInContentEditMode = core.getContentEditManager().isInContentEditMode();
    if (isInContentEditMode) {
      setDisabledDoneBtn(false);
      setDisabledDiscardBtn(false);
    }
  };

  const editBoxesAvailable = () => {
    setDisabledDiscardBtn(false);
  };

  const contentBoxEditedByAI = () => {
    setDisabledDoneBtn(false);
    setDisabledDiscardBtn(false);
  };
  useEffect(() => {
    core.addEventListener('contentBoxEditEnded', contentBoxEditEnded);
    core.addEventListener('contentBoxEditStarted', contentBoxEditStarted);
    window.Core.ContentEdit.addEventListener('editBoxesAvailable', editBoxesAvailable);
    core.getContentEditManager().addEventListener('contentBoxEditedByAI', contentBoxEditedByAI);
    return () => {
      core.removeEventListener('contentBoxEditEnded', contentBoxEditEnded);
      core.removeEventListener('contentBoxEditStarted', contentBoxEditStarted);
      window.Core.ContentEdit.removeEventListener('editBoxesAvailable', editBoxesAvailable);
      core.getContentEditManager().removeEventListener('contentBoxEditedByAI', contentBoxEditedByAI);
    };
  }, []);

  useTextContentUpdated();

  return { disabledDoneBtn: disabledDoneBtn || isProcessingInEditMode, disabledDiscardBtn, setDisabledDoneBtn };
}
