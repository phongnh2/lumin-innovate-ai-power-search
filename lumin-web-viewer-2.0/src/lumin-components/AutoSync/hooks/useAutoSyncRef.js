import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useLatestRef } from 'hooks/useLatestRef';
import { useShallowSelector } from 'hooks/useShallowSelector';

import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';

export default function useAutoSyncRef({ changeQueue, canUseAutoSavePageTools }) {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);
  const isPageEditMode = useSelector(selectors.isPageEditMode);
  const isUsingPageToolsWithAI = useSelector(editorChatBotSelectors.getIsUsingPageToolsWithAI);
  const currentDocumentRef = useLatestRef(currentDocument);
  const isPageEditModeRef = useLatestRef(isPageEditMode);
  const currentUserRef = useLatestRef(currentUser);
  const canUseAutoSavePageToolsRef = useLatestRef(canUseAutoSavePageTools);
  const changeQueueRef = useLatestRef(changeQueue);
  const isInContentEditModeRef = useLatestRef(isInContentEditMode);
  const isUsingPageToolsWithAIRef = useLatestRef(isUsingPageToolsWithAI);

  return {
    currentDocumentRef,
    isPageEditModeRef,
    changeQueueRef,
    canUseAutoSavePageToolsRef,
    isInContentEditModeRef,
    currentUserRef,
    isUsingPageToolsWithAIRef,
  };
}
