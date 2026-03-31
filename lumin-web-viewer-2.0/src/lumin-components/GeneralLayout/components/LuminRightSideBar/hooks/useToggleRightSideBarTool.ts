import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';
import { LayoutElements } from '@new-ui/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import fireEvent from 'helpers/fireEvent';
import { withExitFormBuildChecking } from 'helpers/toggleFormFieldCreationMode';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { eventTracking } from 'utils/recordUtil';

import { useEnabledChatBot } from 'features/EditorChatBot/hooks/useEnableChatBot';
import { readAloudActions } from 'features/ReadAloud/slices';

import { CUSTOM_EVENT } from 'constants/customEvent';
import UserEventConstants from 'constants/eventConstants';

import { useEnableRightSideBarTool } from './useEnableRightSideBarTool';

export const useToggleRightSideBarTool = () => {
  const dispatch = useDispatch();
  const rightPanelValue = useSelector(selectors.rightPanelValue);
  const isPageEditMode = useSelector(selectors.isPageEditMode);
  const isRightPanelOpen = useSelector(selectors.isRightPanelOpen);
  const isOpenSearchOverlay = useSelector(selectors.isOpenSearchOverlay);

  const { enabled: enabledChatbot } = useEnabledChatBot();
  const { enabled: enabledRightSideBarTool } = useEnableRightSideBarTool();
  const isActiveChatbot = isRightPanelOpen && rightPanelValue === LayoutElements.CHATBOT;
  const isActiveCommentHistoryButton = isRightPanelOpen && rightPanelValue === LayoutElements.NOTE_HISTORY;
  const isActiveSummarizationButton = isRightPanelOpen && rightPanelValue === LayoutElements.SUMMARIZATION;

  const _onChangeLayout = useCallback(
    (elementName: string) => {
      fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
        elementName,
        isOpen: !isRightPanelOpen,
      });
    },
    [isRightPanelOpen]
  );

  const onChangeLayout = withExitFormBuildChecking(_onChangeLayout);

  const toggleChatBot = ToolSwitchableChecker.createToolSwitchableHandler(() => {
    onChangeLayout(LayoutElements.CHATBOT);
    if (!isActiveChatbot) {
      eventTracking(UserEventConstants.EventType.CHATBOT_OPENED).catch(() => {});
    }
  });

  const resetSearch = useCallback(() => {
    dispatch(actions.resetSearch() as AnyAction);
  }, [dispatch]);

  const toggleSearchOverlay = ToolSwitchableChecker.createToolSwitchableHandler(() => {
    if (isOpenSearchOverlay) {
      resetSearch();
      core.clearSearchResults();
    }
    onChangeLayout(LayoutElements.SEARCH_OVERLAY);
  });

  const onEnableRightSidebarTools = useCallback(() => {
    if (isPageEditMode) {
      core.disableReadOnlyMode();
    }
    dispatch(actions.setIsToolPropertiesOpen(false));
    dispatch(readAloudActions.setIsInReadAloudMode(false));
    dispatch(actions.setToolPropertiesValue(TOOL_PROPERTIES_VALUE.DEFAULT));
    dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value));
  }, [dispatch, isPageEditMode]);

  useEffect(() => {
    if (!enabledChatbot && isActiveChatbot) {
      fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
        elementName: LayoutElements.CHATBOT,
        isOpen: false,
      });
    }
  }, [enabledChatbot, isActiveChatbot]);

  return {
    isActiveChatbot,
    isOpenSearchOverlay,
    enabledRightSideBarTool,
    isActiveSummarizationButton,
    isActiveCommentHistoryButton,
    toggleChatBot,
    onChangeLayout,
    toggleSearchOverlay,
    onEnableRightSidebarTools,
  };
};
