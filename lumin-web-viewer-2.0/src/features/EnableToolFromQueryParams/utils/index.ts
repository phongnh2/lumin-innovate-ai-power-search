import { t } from 'i18next';
import { AnyAction } from 'redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';
import { switchTool } from '@new-ui/components/LuminToolbar/utils';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import { TriggerDownloadDocumentSource } from 'luminComponents/SaveAsModal/constant';

import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';
import { AppFeaturesType } from 'features/FeatureConfigs/featureStoragePolicies';
import { accessToolModalActions } from 'features/ToolPermissionChecker/slices/accessToolModalSlice';

import { general } from 'constants/documentType';
import { DownloadType } from 'constants/downloadPdf';
import UserEventConstants from 'constants/eventConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { TOOLS_NAME, IToolName } from 'constants/toolsName';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { PdfAction, ToolCategory } from '../constants';
import {
  PdfActionConfigType,
  PdfActionToToolMapperType,
  PdfActionType,
  ToolCategoryConfigType,
  ToolCategoryMapperType,
  ToolCategoryType,
  ToolConfig,
} from '../type';

const { dispatch } = store;

export const isValidDocToNavigate = ({
  service,
  mimeType,
  featureName,
}: {
  service: IDocumentBase['service'];
  mimeType: IDocumentBase['mimeType'];
  featureName?: AppFeaturesType;
}): boolean => {
  if (featureName) {
    return (
      featureStoragePolicy.isFeatureEnabledForMimeType(featureName, mimeType) &&
      featureStoragePolicy.isFeatureEnabledForStorage(featureName, service)
    );
  }

  return service === STORAGE_TYPE.S3 || (service === STORAGE_TYPE.GOOGLE && mimeType === general.PDF);
};

export const PAGE_TOOLS_ACTION_TO_TOOL_CATEGORY_MAPPER: PdfActionToToolMapperType = {
  [PdfAction.OCR]: {
    toolCategory: ToolCategory.TAB,
    toolName: TOOLS_NAME.OCR,
    toolbarValue: LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value,
  },
  [PdfAction.SPLIT_PDF]: {
    toolCategory: ToolCategory.TAB,
    toolName: TOOLS_NAME.SPLIT_PAGE,
    toolbarValue: LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value,
    toolPropertiesValue: TOOL_PROPERTIES_VALUE.SPLIT_EXTRACT,
  },
  [PdfAction.MERGE]: {
    toolCategory: ToolCategory.TAB,
    toolPropertiesValue: TOOL_PROPERTIES_VALUE.MERGE,
    toolbarValue: LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value,
    featureName: AppFeatures.MERGE_FILE,
    toolName: TOOLS_NAME.MERGE_PAGE,
  },
  [PdfAction.DELETE_PAGE]: {
    toolCategory: ToolCategory.TAB,
    toolPropertiesValue: TOOL_PROPERTIES_VALUE.DELETE,
    toolbarValue: LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value,
  },
  [PdfAction.CROP_PAGE]: {
    toolCategory: ToolCategory.TAB,
    toolPropertiesValue: TOOL_PROPERTIES_VALUE.CROP,
    toolbarValue: LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value,
  },
  [PdfAction.PAGE_TOOLS]: {
    toolCategory: ToolCategory.TAB,
    toolbarValue: LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value,
  },
  [PdfAction.EXTRACT_PDF]: {
    toolCategory: ToolCategory.TAB,
    toolName: TOOLS_NAME.SPLIT_PAGE,
    toolbarValue: LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value,
    toolPropertiesValue: TOOL_PROPERTIES_VALUE.SPLIT_EXTRACT,
  },
  [PdfAction.ROTATE_PDF]: {
    toolCategory: ToolCategory.TAB,
    toolName: TOOLS_NAME.ROTATE_PAGE,
    toolbarValue: LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value,
    toolPropertiesValue: TOOL_PROPERTIES_VALUE.ROTATE,
  },
};

export const isPageToolsEnabledForAction = (actionQuery: PdfActionType): boolean =>
  Object.keys(PAGE_TOOLS_ACTION_TO_TOOL_CATEGORY_MAPPER).includes(actionQuery);

const PDF_ACTION_TO_TOOL_CATEGORY_MAPPER: PdfActionToToolMapperType = {
  [PdfAction.SUMMARIZATION]: {
    toolCategory: ToolCategory.TAB,
    toolName: TOOLS_NAME.DOCUMENT_SUMMARIZATION,
    toolbarValue: LEFT_SIDE_BAR_VALUES.ANNOTATION.value,
  },
  [PdfAction.FORM_BUILD]: {
    toolCategory: ToolCategory.TAB,
    toolName: TOOLS_NAME.FORM_BUILDER,
    toolbarValue: LEFT_SIDE_BAR_VALUES.FILL_AND_SIGN.value,
    toolPropertiesValue: TOOL_PROPERTIES_VALUE.FORM_BUILD,
  },
  [PdfAction.COMPRESS]: {
    toolCategory: ToolCategory.DOWNLOAD_MODAL,
  },
  [PdfAction.JPG_TO_PDF]: {
    toolCategory: ToolCategory.DOWNLOAD_MODAL,
  },
  [PdfAction.UNLOCK]: {
    toolCategory: ToolCategory.TAB,
    toolName: TOOLS_NAME.PASSWORD_PROTECTION,
    toolbarValue: LEFT_SIDE_BAR_VALUES.SECURITY.value,
    featureName: AppFeatures.REMOVE_PASSWORD,
  },
  [PdfAction.ANNOTATE]: {
    toolCategory: ToolCategory.TOOL,
    toolName: TOOLS_NAME.FREEHAND,
    eventElementName: UserEventConstants.Events.HeaderButtonsEvent.FREE_HAND_TOOL,
  },
  [PdfAction.READ]: {
    toolCategory: ToolCategory.TAB,
    toolbarValue: LEFT_SIDE_BAR_VALUES.POPULAR.value,
  },
  [PdfAction.CONVERT_TO_PDF]: {
    toolCategory: ToolCategory.DOWNLOAD_MODAL,
  },
  [PdfAction.POPULAR_TAB]: {
    toolCategory: ToolCategory.TAB,
    toolbarValue: LEFT_SIDE_BAR_VALUES.POPULAR.value,
  },
  [PdfAction.ANNOTATE_TAB]: {
    toolCategory: ToolCategory.TAB,
    toolbarValue: LEFT_SIDE_BAR_VALUES.ANNOTATION.value,
  },
  [PdfAction.FILL_SIGN_TAB]: {
    toolCategory: ToolCategory.TAB,
    toolbarValue: LEFT_SIDE_BAR_VALUES.FILL_AND_SIGN.value,
  },
  [PdfAction.SECURITY_TAB]: {
    toolCategory: ToolCategory.TAB,
    toolbarValue: LEFT_SIDE_BAR_VALUES.SECURITY.value,
    featureName: AppFeatures.REDACTION,
    toolName: TOOLS_NAME.REDACTION,
  },
  [PdfAction.DOWNLOAD_FILE]: {
    toolCategory: ToolCategory.DOWNLOAD_MODAL,
  },
  [PdfAction.EDIT_TEXT]: {
    toolCategory: ToolCategory.TAB,
    toolbarValue: LEFT_SIDE_BAR_VALUES.EDIT_PDF.value,
    toolPropertiesValue: TOOL_PROPERTIES_VALUE.EDIT_PDF,
    featureName: AppFeatures.EDIT_PDF,
    toolName: TOOLS_NAME.CONTENT_EDIT,
  },
  [PdfAction.PROTECT_PDF]: {
    toolCategory: ToolCategory.SECURITY,
    toolbarValue: LEFT_SIDE_BAR_VALUES.SECURITY.value,
    featureName: AppFeatures.SET_PASSWORD,
    toolName: TOOLS_NAME.PASSWORD_PROTECTION,
  },
  [PdfAction.REDACT_PDF]: {
    toolCategory: ToolCategory.SECURITY,
    toolbarValue: LEFT_SIDE_BAR_VALUES.SECURITY.value,
    featureName: AppFeatures.REDACTION,
    toolName: TOOLS_NAME.REDACTION,
  },
  [PdfAction.FLATTEN_PDF]: {
    toolCategory: ToolCategory.DOWNLOAD_MODAL,
  },
  [PdfAction.CHAT_PDF]: {
    toolCategory: ToolCategory.TAB,
    toolName: TOOLS_NAME.CHATBOT,
    toolbarValue: LEFT_SIDE_BAR_VALUES.POPULAR.value,
  },
  ...PAGE_TOOLS_ACTION_TO_TOOL_CATEGORY_MAPPER,
};

export const getToolCategoriesFromPdfAction = (actionQuery: PdfActionType) => {
  switch (actionQuery) {
    case PdfAction.WORD_TO_PDF:
    case PdfAction.EXCEL_TO_PDF:
    case PdfAction.POWERPOINT_TO_PDF:
    case PdfAction.PNG_TO_PDF:
    case PdfAction.PDF_TO_EXCEL:
    case PdfAction.PDF_TO_WORD:
    case PdfAction.PDF_TO_POWERPOINT:
    case PdfAction.PDF_TO_JPG:
    case PdfAction.PDF_TO_PNG: {
      return {
        toolCategory: ToolCategory.DOWNLOAD_MODAL,
      };
    }
    default: {
      return PDF_ACTION_TO_TOOL_CATEGORY_MAPPER[actionQuery] || {};
    }
  }
};

export const getToolInfo = (actionQuery: PdfActionType): PdfActionConfigType =>
  getToolCategoriesFromPdfAction(actionQuery) || {};

const isPreviewMode = (): boolean => selectors.isPreviewOriginalVersionMode(store.getState());

const shouldSkipToolConfig = (toolConfig?: ToolConfig): boolean =>
  Boolean(toolConfig && !toolConfig.isAvailable && toolConfig.shouldCloseTabAtLimit);

const handlePageToolsMode = (toolbarValue?: string): void => {
  if (toolbarValue === LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value) {
    dispatch(actions.openPageEditMode() as AnyAction);
  }
};

const handleUnavailableTool = ({
  toolName,
  featureName,
  toolConfig,
}: {
  toolName?: IToolName;
  featureName?: AppFeaturesType;
  toolConfig?: ToolConfig;
}): void => {
  const missingConfig = !toolConfig || toolConfig.isAvailable;
  const isChatbotTool = toolName === TOOLS_NAME.CHATBOT;
  if (missingConfig || isChatbotTool) {
    return;
  }

  dispatch(
    accessToolModalActions.openModal({
      toolName,
      featureName,
      eventName: toolConfig.eventName,
    })
  );
};

const handleAvailableTool = async ({
  toolName,
  featureName,
  toolConfig,
}: {
  toolName?: IToolName;
  featureName?: AppFeaturesType;
  toolConfig?: ToolConfig;
}): Promise<void> => {
  if (!toolConfig || !toolConfig.isAvailable) {
    return;
  }

  await toolConfig.handler({ dispatch, toolName, featureName });
};

const handleToolProperties = (toolPropertiesValue?: string): void => {
  if (!toolPropertiesValue) {
    return;
  }

  dispatch(actions.setIsToolPropertiesOpen(true) as AnyAction);
  dispatch(actions.setToolPropertiesValue(toolPropertiesValue) as AnyAction);
};

const handlePasswordProtectionTool = async ({
  toolName,
  featureName,
  toolConfig,
}: {
  toolName?: IToolName;
  featureName?: AppFeaturesType;
  toolConfig?: ToolConfig;
}): Promise<void> => {
  if (!toolConfig) return;

  if (!toolConfig.isAvailable) {
    handleUnavailableTool({ toolName, featureName, toolConfig });
    return;
  }

  await handleAvailableTool({ toolName, featureName, toolConfig });
};

const TOOL_CATEGORY_MAPPER: ToolCategoryMapperType = {
  [ToolCategory.SECURITY]: {
    triggerOpenContainer: () => {
      dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.SECURITY.value) as AnyAction);
    },
    triggerOpenTool: async ({ toolName, featureName, toolConfig }) => {
      if (toolName === TOOLS_NAME.PASSWORD_PROTECTION) {
        await handlePasswordProtectionTool({ toolName, featureName, toolConfig });
        return;
      }

      if (!toolConfig.isAvailable && toolName === TOOLS_NAME.REDACTION) {
        dispatch(
          accessToolModalActions.openModal({
            toolName,
            featureName,
            eventName: toolConfig.eventName,
          })
        );
        return;
      }

      switchTool({ toolName });
    },
  },
  [ToolCategory.TOOL]: {
    triggerOpenTool: ({ eventElementName, toolName }) => {
      switchTool({
        toolName,
        eventElementName,
      });
    },
  },
  [ToolCategory.DOWNLOAD_MODAL]: {
    triggerOpenTool: ({ customHandler, toolName, featureName, toolConfig }) => {
      if (!toolConfig?.isAvailable) {
        handleUnavailableTool({ toolName, featureName, toolConfig });
        return;
      }
      customHandler?.();
    },
  },
  [ToolCategory.TAB]: {
    triggerOpenContainer: ({ pdfAction, toolConfig }) => {
      if (isPreviewMode() || shouldSkipToolConfig(toolConfig)) {
        return;
      }

      const { toolbarValue } = getToolInfo(pdfAction);

      handlePageToolsMode(toolbarValue);
      dispatch(actions.setToolbarValue(toolbarValue) as AnyAction);
    },
    triggerOpenTool: async ({ toolPropertiesValue, toolName, featureName, toolConfig }) => {
      if (isPreviewMode()) {
        return;
      }

      if (toolConfig) {
        if (!toolConfig.isAvailable) {
          handleUnavailableTool({ toolName, featureName, toolConfig });
          return;
        }

        await handleAvailableTool({ toolName, featureName, toolConfig });
      }

      handleToolProperties(toolPropertiesValue);
    },
  },
};

export const getToolCategoryData = (toolCategory: ToolCategoryType): ToolCategoryConfigType =>
  TOOL_CATEGORY_MAPPER[toolCategory] || {};

export const getDownloadType = (actionQuery: PdfActionType) => {
  switch (actionQuery) {
    case PdfAction.WORD_TO_PDF:
    case PdfAction.EXCEL_TO_PDF:
    case PdfAction.POWERPOINT_TO_PDF:
    case PdfAction.PNG_TO_PDF:
    case PdfAction.JPG_TO_PDF:
    case PdfAction.FLATTEN_PDF: {
      return DownloadType.PDF;
    }
    case PdfAction.PDF_TO_WORD: {
      return DownloadType.DOCX;
    }
    case PdfAction.PDF_TO_POWERPOINT: {
      return DownloadType.PPTX;
    }
    case PdfAction.PDF_TO_EXCEL: {
      return DownloadType.XLSX;
    }
    case PdfAction.PDF_TO_JPG: {
      return DownloadType.JPG;
    }
    case PdfAction.PDF_TO_PNG: {
      return DownloadType.PNG;
    }
    default: {
      return DownloadType.PDF;
    }
  }
};

export const getDownloadModalData = ({
  actionQuery,
  openedElementData,
}: {
  actionQuery: PdfActionType;
  openedElementData: Record<string, unknown>;
}) => {
  const toolCategories = getToolCategoriesFromPdfAction(actionQuery);
  const { toolName: finalizedActionName } = toolCategories || {};

  if (
    !Object.values(PdfAction).includes(actionQuery) ||
    !finalizedActionName ||
    openedElementData.source !== TriggerDownloadDocumentSource.LANDING_PAGE
  ) {
    return {
      title: t('viewer.downloadModal.title'),
      subTitle: t('viewer.downloadModal.format'),
    };
  }

  const action = t(`viewer.downloadModal.action.${finalizedActionName}`);

  return {
    title: t('viewer.downloadModal.actionTitle', { action }),
    subTitle: t('viewer.downloadModal.actionDescription', { action }),
  };
};
