import { Dispatch } from '@reduxjs/toolkit';

import { AppFeaturesType } from 'features/FeatureConfigs/featureStoragePolicies';

import { PremiumToolsPopOverEventType } from 'constants/premiumToolsPopOverEvent';
import { IToolName } from 'constants/toolsName';

import { PdfAction, ToolCategory } from './constants';

export type ToolCategoryType = typeof ToolCategory[keyof typeof ToolCategory];

export type PdfActionType = typeof PdfAction[keyof typeof PdfAction];

interface ToolHandlerParams {
  dispatch: Dispatch;
  toolName: string;
  featureName: string;
}

export interface ToolConfig {
  isAvailable: boolean;
  shouldCloseTabAtLimit?: boolean;
  eventName?: PremiumToolsPopOverEventType;
  handler: (params: ToolHandlerParams) => void | Promise<void>;
}

export type ToolCategoryConfigType = {
  toolName?: IToolName;
  triggerOpenContainer?: (params: { pdfAction?: PdfActionType; toolConfig?: ToolConfig }) => void;
  triggerOpenTool?: (params: {
    eventElementName?: string;
    toolName?: IToolName;
    featureName?: AppFeaturesType;
    toolPropertiesValue?: string;
    customHandler?: () => void;
    toolConfig?: ToolConfig;
  }) => void;
};

export type ToolCategoryMapperType = {
  [key in ToolCategoryType]?: ToolCategoryConfigType;
};

export type PdfActionConfigType = {
  toolCategory?: ToolCategoryType;
  toolName?: IToolName;
  eventElementName?: string;
  toolPropertiesValue?: string;
  toolbarValue?: string;
  featureName?: AppFeaturesType;
};

export type PdfActionToToolMapperType = {
  [key in PdfActionType]?: PdfActionConfigType;
};

export type PdfActionNameMapperType = {
  [key in PdfActionType]?: string;
};
