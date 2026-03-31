import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { LayoutElements } from '@new-ui/constants';

import actions from 'actions';
import selectors from 'selectors';

import SingleButton from 'luminComponents/ViewerCommonV2/ToolButton/SingleButton';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { documentSyncSelectors } from 'features/Document/document-sync.slice';
import { formBuilderSelectors } from 'features/DocumentFormBuild/slices';
import { useReadAloudContext } from 'features/ReadAloud/hooks/useReadAloudContext';
import { readAloudActions } from 'features/ReadAloud/slices';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { DataElements } from 'constants/dataElement';
import { SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';

const ReadAloudTool = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isInFormBuilderMode = useSelector(formBuilderSelectors.isInFormBuildMode);

  const globalSaveStatus = useSelector(documentSyncSelectors.getSaveOperationsGlobalStatus);
  const isLeftPanelOpen = useSelector(selectors.isLeftPanelOpen);
  const rightPanelValue = useSelector(selectors.rightPanelValue);
  const isRightPanelOpen = useSelector(selectors.isRightPanelOpen);

  const { voicesByWebSpeechAPI, isFindingPageExistText, firstPageTextDetected } = useReadAloudContext();

  const handleActivateTool = useCallback(() => {
    if (!firstPageTextDetected) {
      dispatch(readAloudActions.setIsNoTextModalOpen(true));
      return;
    }

    if (isLeftPanelOpen) {
      dispatch(actions.setIsLeftPanelOpen(false));
    }

    if (rightPanelValue !== LayoutElements.SEARCH && isRightPanelOpen) {
      dispatch(actions.setIsRightPanelOpen(false));
    }

    dispatch(readAloudActions.setIsInReadAloudMode(true));
  }, [dispatch, firstPageTextDetected, isLeftPanelOpen, rightPanelValue, isRightPanelOpen]);

  useEffect(() => {
    window.addEventListener(CUSTOM_EVENT.TOGGLE_READ_ALOUD_BUTTON, handleActivateTool);
    return () => {
      window.removeEventListener(CUSTOM_EVENT.TOGGLE_READ_ALOUD_BUTTON, handleActivateTool);
    };
  }, [handleActivateTool]);

  return (
    <SingleButton
      tooltipData={{ placement: 'bottom', title: t('viewer.readAloud.readAloud') }}
      icon="read-aloud"
      disabled={
        !voicesByWebSpeechAPI.length ||
        isFindingPageExistText ||
        isInFormBuilderMode ||
        globalSaveStatus === SAVE_OPERATION_STATUS.SAVING
      }
      onClick={handleActivateTool}
      isUsingKiwiIcon
      data-lumin-btn-name={ButtonName.READ_ALOUD_PDF}
      data-element={DataElements.READ_ALOUD_BUTTON}
    />
  );
};

export default ReadAloudTool;
