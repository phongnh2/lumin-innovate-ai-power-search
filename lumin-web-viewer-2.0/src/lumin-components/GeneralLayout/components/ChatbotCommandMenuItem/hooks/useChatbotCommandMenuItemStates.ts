import { useSelector } from 'react-redux';

import { LayoutElements } from '@new-ui/constants';

import selectors from 'selectors';

import { readAloudSelectors } from 'features/ReadAloud/slices';

export const useChatbotCommandMenuItemStates = () => {
  const isDefaultMode = useSelector(selectors.isDefaultMode);
  const rightPanelValue = useSelector(selectors.rightPanelValue);
  const isRightPanelOpen = useSelector(selectors.isRightPanelOpen);
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);

  return {
    isDisabled: !isDefaultMode || isInReadAloudMode,
    isChatBotOpen: rightPanelValue === LayoutElements.CHATBOT && isRightPanelOpen,
  };
};
