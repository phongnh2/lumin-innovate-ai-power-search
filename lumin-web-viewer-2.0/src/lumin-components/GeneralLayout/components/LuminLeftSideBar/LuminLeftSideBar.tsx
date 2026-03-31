import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LuminConvertFileModal from '@new-ui/components/LuminLeftSideBar/LuminConvertFileModal';
import IconButton from '@new-ui/general-components/IconButton';
import { setIsInFocusMode } from 'actions/generalLayoutActions';
import { ToolName } from 'core/type';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ViewerContext from 'screens/Viewer/Context';

import FocusModeSideBar from 'luminComponents/FocusModeSideBar';
import useToolProperties from 'luminComponents/GeneralLayout/hooks/useToolProperties';
import { RequestType } from 'luminComponents/RequestPermissionModal/requestType.enum';

import { useAutoSync } from 'hooks/useAutoSync';
import { useInRedactionMode } from 'hooks/useInRedactionMode';
import { useLatestRef } from 'hooks/useLatestRef';
import { usePrevious } from 'hooks/usePrevious';
import { useRenderConvertFileModal } from 'hooks/useRenderConvertFileModal';
import { useRequestPermissionChecker } from 'hooks/useRequestPermissionChecker';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { isSyncableFile } from 'helpers/autoSync';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { eventTracking } from 'utils/recordUtil';
import toastUtils from 'utils/toastUtils';

import { ExploredFeatures } from 'features/EnableToolFromQueryParams/constants';
import { useManipulationMode } from 'features/FileSync';
import { useFocusModeToggleStore } from 'features/FocusMode/hook/useFocusModeToggleStore';
import { measureToolActions, measureToolSelectors } from 'features/MeasureTool/slices';
import { useIsOpenViewerNavigation } from 'features/ViewerNavigation';

import { AUTO_SYNC_ERROR } from 'constants/autoSyncConstant';
import { DataElements } from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { PageToolViewMode, documentStorage } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { TOOLS_NAME } from 'constants/toolsName';

import { LEFT_SIDE_BAR_VALUES } from './constants';
import { useSyncOnContentChange } from './hooks/useSyncOnContentChange';
import LeftSideBarContent from './LeftSideBarContent';
import { openWarningEditTextModal } from './utils';
import { TOOL_PROPERTIES_VALUE } from '../LuminLeftPanel/constants';
import { getShortcut } from '../LuminToolbar/utils';

import * as Styled from './LuminLeftSideBar.styled';

const LuminLeftSideBar = () => {
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isPageEditMode = useSelector(selectors.isPageEditMode);
  const isPreviewOriginalVersionMode = useSelector(selectors.isPreviewOriginalVersionMode);
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);
  const isLoadingDocument = useSelector(selectors.isLoadingDocument);
  const isInFocusMode = useSelector(selectors.isInFocusMode);
  const isInPresenterMode = useSelector(selectors.isInPresenterMode);
  const toolPropertiesValue = useSelector(selectors.toolPropertiesValue);
  const toolbarValue = useSelector(selectors.toolbarValue);

  const isViewerNavigationExpanded = useIsOpenViewerNavigation();
  const isMeasureToolActive = useSelector(measureToolSelectors.isActive);
  const { bookmarkIns, deletedPageToastId } = useContext(ViewerContext);
  const { t } = useTranslation();
  const hasClickedCloseButtonRef = useRef<boolean>(false);
  const { isInRedactionMode } = useInRedactionMode();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const { closeToolPropertiesPanel, enterEditPdfTool } = useToolProperties();
  const prevToolbarValue = usePrevious(toolbarValue);
  const toolbarValueRef = useLatestRef(toolbarValue);
  const { withEditPermission, requestAccessModalElement } = useRequestPermissionChecker({
    permissionRequest: RequestType.EDITOR,
  });
  const shouldListenChangedFile =
    toolbarValue === LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value && toolPropertiesValue !== TOOL_PROPERTIES_VALUE.MERGE;
  const { fileContentChanged } = useManipulationMode({
    shouldListenChangedFile,
  });
  const [syncOnContentChange] = useSyncOnContentChange();

  const { shouldOpenConvertFileModal } = useRenderConvertFileModal();

  // Action dispatchers
  const openPageEditMode = () => dispatch(actions.openPageEditMode());
  const changePageEditDisplayMode = (displayMode: string) => dispatch(actions.changePageEditDisplayMode(displayMode));
  const closePageEditMode = () => dispatch(actions.closePageEditMode());
  const closeElements = (dataElement: string) => dispatch(actions.closeElements(dataElement));
  const setIsToolPropertiesOpen = (value: boolean) => dispatch(actions.setIsToolPropertiesOpen(value));
  const closeLuminRightPanel = () => dispatch(actions.closeLuminRightPanel());

  const closeEditMode = () => {
    if (isPageEditMode) {
      changePageEditDisplayMode(PageToolViewMode.GRID);
      bookmarkIns.reGenerateBookmarks();
    } else {
      closePageEditMode();
    }
    core.disableReadOnlyMode();
  };

  const setToolbarValue = (value: string) => dispatch(actions.setToolbarValue(value));

  const { handleSyncFile, isFileContentChanged: isDriveFileContentChanged } = useAutoSync({
    onSyncSuccess: () => {
      closeElements(DataElements.LOADING_MODAL);
      if (hasClickedCloseButtonRef.current && toolbarValueRef.current !== LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value) {
        closeEditMode();
        hasClickedCloseButtonRef.current = false;
      }
    },
    onError: (_, reason) => {
      if (
        hasClickedCloseButtonRef.current &&
        toolbarValueRef.current !== LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value &&
        reason !== AUTO_SYNC_ERROR.CANCEL_SYNC_REQUEST
      ) {
        closeEditMode();
        hasClickedCloseButtonRef.current = false;
      }
      closeElements(DataElements.LOADING_MODAL);
    },
  });

  useEffect(() => {
    const isSecurityToolbarSelected = prevToolbarValue === LEFT_SIDE_BAR_VALUES.SECURITY.value;
    if (isSecurityToolbarSelected && isInRedactionMode) {
      core.setToolMode(defaultTool as ToolName);
    }
    if (toolbarValue !== LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value) {
      closePageEditMode();
    }
    if (toolbarValue !== LEFT_SIDE_BAR_VALUES.ANNOTATION.value && isMeasureToolActive) {
      dispatch(measureToolActions.setIsActive(false));
    }
  }, [toolbarValue]);

  const handleOpenPageEditMode = () => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: UserEventConstants.Events.HeaderButtonsEvent.PAGE_TOOLS_BUTTON,
    });
    const triggerOpenPageEditMode = () => {
      if (shouldOpenConvertFileModal) {
        setIsOpenModal(true);
      } else {
        bookmarkIns.prevBookmarks = { ...bookmarkIns.bookmarksUser };
        core.deselectAllAnnotations();
        core.enableReadOnlyMode();
        core.setToolMode(defaultTool as ToolName);
        openPageEditMode();
      }
    };
    const shouldStopEvent =
      toggleFormFieldCreationMode() || promptUserChangeToolMode({ callback: triggerOpenPageEditMode });
    if (shouldStopEvent) {
      return;
    }
    triggerOpenPageEditMode();
  };

  const handleClickViewerButton = async () => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: UserEventConstants.Events.HeaderButtonsEvent.PAGE_TOOLS_BUTTON,
    });

    hasClickedCloseButtonRef.current = true;
    const isSyncableDriveFile = isSyncableFile(currentDocument);
    if (isDriveFileContentChanged && isSyncableDriveFile) {
      handleSyncFile();
      return;
    }
    if (fileContentChanged && currentDocument.service === documentStorage.s3) {
      if (deletedPageToastId) {
        await toastUtils.waitForToastRemoval(deletedPageToastId);
      }
      await syncOnContentChange();
    }
    closeEditMode();
  };

  const activePageTool = (value: string) => {
    handleOpenPageEditMode();
    closeToolPropertiesPanel();
    closeLuminRightPanel();
    setToolbarValue(value);
  };

  const activeSecurityTool = async () => {
    closeToolPropertiesPanel();
    await handleClickViewerButton();
    setToolbarValue(LEFT_SIDE_BAR_VALUES.SECURITY.value);
  };

  const activeEditPdfTool = withEditPermission(
    () => {
      openWarningEditTextModal({
        dispatch,
        t,
        setToolbarValue,
        setIsToolPropertiesOpen,
        currentDocument,
        enterEditPdfTool,
        handleClickViewerButton,
        closeEditMode,
      });
    },
    null,
    ExploredFeatures.EDIT_PDF
  );

  const triggerConfirmButton = (value: string) => {
    if (value === toolbarValueRef.current) {
      return;
    }

    switch (value) {
      case LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value: {
        activePageTool(value);
        break;
      }
      case LEFT_SIDE_BAR_VALUES.EDIT_PDF.value: {
        ToolSwitchableChecker.createToolSwitchableHandler(activeEditPdfTool)();
        break;
      }
      case LEFT_SIDE_BAR_VALUES.SECURITY.value: {
        activeSecurityTool();

        break;
      }

      default: {
        handleClickViewerButton();
        closeToolPropertiesPanel();
        setToolbarValue(value);
      }
    }
  };

  const triggerCancelButton = (value: string) => {
    if (value === LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value) {
      activePageTool(value);
      return;
    }
    if (value === LEFT_SIDE_BAR_VALUES.SECURITY.value) {
      activeSecurityTool();
      return;
    }
    handleClickViewerButton();
    closeToolPropertiesPanel();
    setToolbarValue(value);
  };

  const onBtnClick = (value: string): boolean => {
    const shouldBlockNextAction =
      toggleFormFieldCreationMode() ||
      promptUserChangeToolMode({
        callback: () => triggerConfirmButton(value),
        applyForTool: TOOLS_NAME.REDACTION,
      });
    if (shouldBlockNextAction) {
      return false;
    }

    if (isInContentEditMode) {
      if (LEFT_SIDE_BAR_VALUES.EDIT_PDF.value === value) {
        return false;
      }
      promptUserChangeToolMode({
        callback: () => triggerConfirmButton(value),
        cancelCallback: () => triggerCancelButton(value),
      });
      return false;
    }

    triggerConfirmButton(value);
    return true;
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value);
  };

  const toggleFocusMode = () => {
    dispatch(setIsInFocusMode(!isInFocusMode));
    useFocusModeToggleStore.getState().setIsClickFocusModeBtn(!isInFocusMode);
  };

  if (isPreviewOriginalVersionMode) {
    return null;
  }

  return (
    <>
      <Styled.LeftSideBar
        id="leftSideBar"
        $isInFocusMode={isInFocusMode}
        data-navigation-expanded={isViewerNavigationExpanded}
        $isInPresenterMode={isInPresenterMode}
      >
        <Styled.LeftSideBarWrapper>
          <LeftSideBarContent onClick={onBtnClick} />
          <Styled.LeftSideBarBottom>
            {!isViewerNavigationExpanded && (
              <IconButton
                icon="lg_collapse_right_panel"
                iconSize={24}
                size="large"
                onClick={toggleFocusMode}
                tooltipData={{
                  location: 'left',
                  title: t('generalLayout.focusMode.tooltip'),
                  shortcut: getShortcut('focusMode'),
                }}
                disabled={isLoadingDocument}
              />
            )}
          </Styled.LeftSideBarBottom>
        </Styled.LeftSideBarWrapper>
      </Styled.LeftSideBar>
      <FocusModeSideBar
        sideBarContent={<LeftSideBarContent onClick={onBtnClick} />}
        onExpand={toggleFocusMode}
        isInFocusMode={isInFocusMode}
        isInPresenterMode={isInPresenterMode}
        isLeftSideBar
      />
      <LuminConvertFileModal isOpen={isOpenModal} onClose={handleCloseModal} currentDocument={currentDocument} />
      {requestAccessModalElement}
    </>
  );
};

export default LuminLeftSideBar;
