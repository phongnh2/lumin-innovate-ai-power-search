import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import selectors from 'selectors';

import useNavigateToPageTools from 'screens/Viewer/hooks/useNavigateToPageTools';

import { TriggerDownloadDocumentSource } from 'luminComponents/SaveAsModal/constant';

import useDocumentTools from 'hooks/useDocumentTools';
import useShallowSelector from 'hooks/useShallowSelector';
import { useUrlSearchParams } from 'hooks/useUrlSearchParams';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';
import { accessToolModalActions } from 'features/ToolPermissionChecker/slices/accessToolModalSlice';

import { TOOLS_NAME } from 'constants/toolsName';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { useOpenRemovePasswordModal } from './useOpenRemovePasswordModal';
import { useToolConfig } from './useToolConfig';
import { PdfActionType } from '../type';
import { getToolInfo, getToolCategoryData, isValidDocToNavigate } from '../utils';

const useEnableToolFromQueryParams = ({ disabled }: { disabled: boolean }): void => {
  const { service, mimeType } = useShallowSelector(selectors.getCurrentDocument) || {};
  const { handleDownloadDocument } = useDocumentTools();
  const [openedTool, setOpenedTool] = useState(false);
  const dispatch = useDispatch();
  const { openRemovePasswordModal } = useOpenRemovePasswordModal();
  const isDocumentLoaded = useSelector(selectors.isDocumentLoaded);
  const isConvertingBase64ToSignedUrl = useSelector<unknown, boolean>(selectors.isConvertingBase64ToSignedUrl);

  const openDownloadModal = handlePromptCallback({
    callback: handleDownloadDocument({
      source: TriggerDownloadDocumentSource.LANDING_PAGE,
    }),
    applyForTool: TOOLS_NAME.REDACTION,
  });
  const searchParams = useUrlSearchParams();
  const actionQuery = searchParams.get(UrlSearchParam.ACTION);

  const toolInfo = getToolInfo(actionQuery as PdfActionType);
  const toolConfig = useToolConfig();
  const toolCategoryData = getToolCategoryData(toolInfo.toolCategory);

  useNavigateToPageTools();

  useEffect(() => {
    if (
      disabled ||
      !isValidDocToNavigate({ service, mimeType, featureName: toolInfo.featureName }) ||
      !actionQuery ||
      openedTool ||
      !isDocumentLoaded ||
      isConvertingBase64ToSignedUrl
    ) {
      return;
    }

    const { triggerOpenContainer } = toolCategoryData || {};
    triggerOpenContainer?.({ pdfAction: actionQuery as PdfActionType, toolConfig });
  }, [actionQuery, disabled, openedTool, toolConfig, isDocumentLoaded, isConvertingBase64ToSignedUrl]);

  useEffect(() => {
    if (toolInfo.featureName && !featureStoragePolicy.isFeatureEnabledForMimeType(toolInfo.featureName, mimeType)) {
      dispatch(
        accessToolModalActions.openModal({
          toolName: toolInfo.toolName,
          featureName: toolInfo.featureName,
        })
      );
    }
  }, [mimeType, toolInfo.featureName, toolInfo.toolName]);

  useEffect(() => {
    if (
      disabled ||
      !isValidDocToNavigate({ service, mimeType, featureName: toolInfo.featureName }) ||
      !actionQuery ||
      openedTool ||
      !isDocumentLoaded ||
      isConvertingBase64ToSignedUrl
    ) {
      return;
    }

    const { eventElementName, toolName, toolPropertiesValue, featureName } = toolInfo;
    const { triggerOpenTool } = toolCategoryData || {};
    if (featureName === AppFeatures.REMOVE_PASSWORD) {
      openRemovePasswordModal();
    } else {
      triggerOpenTool?.({
        eventElementName,
        toolName,
        featureName,
        toolPropertiesValue,
        customHandler: openDownloadModal,
        toolConfig,
      });
    }
    setOpenedTool(true);
  }, [
    service,
    mimeType,
    actionQuery,
    disabled,
    openedTool,
    openRemovePasswordModal,
    toolConfig,
    isDocumentLoaded,
    isConvertingBase64ToSignedUrl,
  ]);
};

export default useEnableToolFromQueryParams;
