import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useKey } from 'react-use';

import { LayoutElements } from '@new-ui/constants';

import selectors from 'selectors';

import { useLatestRef } from 'hooks/useLatestRef';
import { useShallowSelector } from 'hooks/useShallowSelector';

import fireEvent from 'helpers/fireEvent';

import { eventTracking } from 'utils/recordUtil';

import { formBuilderSelectors } from 'features/DocumentFormBuild/slices';
import { useEnabledChatBot } from 'features/EditorChatBot/hooks/useEnableChatBot';
import { readAloudSelectors } from 'features/ReadAloud/slices';

import { CUSTOM_EVENT } from 'constants/customEvent';
import UserEventConstants from 'constants/eventConstants';

export const useShortkeyToggleChatbot = () => {
  const isRightPanelOpen = useSelector(selectors.isRightPanelOpen);
  const rightPanelValue = useSelector(selectors.rightPanelValue);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isChatBotOpen = rightPanelValue === LayoutElements.CHATBOT && isRightPanelOpen;
  const isInFormBuilderMode = useSelector(formBuilderSelectors.isInFormBuildMode);
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);
  const isPageEditMode = useSelector(selectors.isPageEditMode);
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const isAnnotationLoaded = useSelector(selectors.getAnnotationsLoaded);

  const { enabled: enabledChatbot } = useEnabledChatBot();

  const isChatBotOpenRef = useLatestRef(isChatBotOpen);
  const isInFormBuilderModeRef = useLatestRef(isInFormBuilderMode);
  const isInContentEditModeRef = useLatestRef(isInContentEditMode);
  const isPageEditModeRef = useLatestRef(isPageEditMode);
  const isInReadAloudModeRef = useLatestRef(isInReadAloudMode);

  const toggleChatbotPanel = useCallback(
    (e: KeyboardEvent) => {
      const canUseShortkey =
        isAnnotationLoaded &&
        enabledChatbot &&
        currentUser &&
        !isInFormBuilderModeRef.current &&
        !isInContentEditModeRef.current &&
        !isPageEditModeRef.current &&
        !isInReadAloudModeRef.current;
      if (!(e.metaKey || e.ctrlKey) || !canUseShortkey) {
        return;
      }
      e.stopPropagation();
      const elementName = isChatBotOpenRef.current ? LayoutElements.DEFAULT : LayoutElements.CHATBOT;
      fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
        elementName,
        isOpen: !isChatBotOpenRef.current,
      });

      eventTracking(UserEventConstants.EventType.CHATBOT_OPENED).catch(() => {});
    },
    [isChatBotOpenRef, enabledChatbot, isAnnotationLoaded]
  );

  useKey('/', toggleChatbotPanel, {}, [enabledChatbot, isAnnotationLoaded]);
};
