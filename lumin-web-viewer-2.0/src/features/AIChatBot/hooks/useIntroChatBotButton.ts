import { useLocalStorage } from '@mantine/hooks';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';
import { useEnableRightSideBarTool } from '@new-ui/components/LuminRightSideBar/hooks/useEnableRightSideBarTool';
import { LayoutElements } from '@new-ui/constants';

import selectors from 'selectors';

import { usePrevious } from 'hooks/usePrevious';
import { useUrlSearchParams } from 'hooks/useUrlSearchParams';

import fireEvent from 'helpers/fireEvent';

import { useEnabledChatBot } from 'features/EditorChatBot/hooks/useEnableChatBot';
import { PdfActionType } from 'features/EnableToolFromQueryParams/constants';
import { isPageToolsEnabledForAction } from 'features/EnableToolFromQueryParams/utils';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { LocalStorageKey } from 'constants/localStorageKey';
import { UrlSearchParam } from 'constants/UrlSearchParam';

export const useIntroChatBotButton = () => {
  const [hasIntroducedChatBotButton, setHasIntroducedChatBotButton] = useLocalStorage({
    key: LocalStorageKey.HAS_INTRODUCED_CHATBOT_BUTTON,
    defaultValue: false,
    getInitialValueInEffect: false,
  });
  const { enabled: enabledRightSideBarTool } = useEnableRightSideBarTool();
  const { enabled: enabledChatbot } = useEnabledChatBot();
  const isDocumentLoaded = useSelector(selectors.isDocumentLoaded);
  const toolbarValue = useSelector(selectors.toolbarValue);
  const searchParams = useUrlSearchParams();
  const actionQuery = searchParams.get(UrlSearchParam.ACTION) as PdfActionType;
  const previousToolbarValue = usePrevious(toolbarValue);
  const isNavigateFromPageTools =
    previousToolbarValue === LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value && previousToolbarValue !== toolbarValue;

  const showChatbotIntro =
    isDocumentLoaded &&
    !hasIntroducedChatBotButton &&
    enabledChatbot &&
    enabledRightSideBarTool &&
    (!isPageToolsEnabledForAction(actionQuery) || isNavigateFromPageTools);

  useEffect(() => {
    if (showChatbotIntro) {
      setHasIntroducedChatBotButton(true);
      fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
        elementName: LayoutElements.CHATBOT,
        isOpen: true,
      });
    }
  }, [showChatbotIntro, setHasIntroducedChatBotButton]);
};
