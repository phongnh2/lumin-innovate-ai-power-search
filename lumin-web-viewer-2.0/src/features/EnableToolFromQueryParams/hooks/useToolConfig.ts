import { useTranslation } from 'react-i18next';

import { LayoutElements } from '@new-ui/constants';

import selectors from 'selectors';

import { useUrlSearchParams } from 'hooks';
import { useEnableFeatureByDomain } from 'hooks/useEnableFeatureByDomain';
import useShallowSelector from 'hooks/useShallowSelector';

import fireEvent from 'helpers/fireEvent';
import { getToolChecker } from 'helpers/getToolPopper';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';
import verifyDocumentDigitalSigned from 'helpers/verifyDocumentDigitalSigned';

import { showDigitalSignatureModal } from 'utils/showDigitalSignatureModal';

import useApplyOcrTool from 'features/DocumentOCR/useApplyOcrTool';
import { useEnabledChatBot } from 'features/EditorChatBot/hooks/useEnableChatBot';

import { DOMAIN_WHITE_LIST } from 'constants/customConstant';
import { CUSTOM_EVENT } from 'constants/customEvent';
import { DataElements } from 'constants/dataElement';
import { FEATURE_VALIDATION } from 'constants/lumin-common';
import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { TOOLS_NAME } from 'constants/toolsName';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { usePasswordProtectionTool } from './usePasswordProtectionTool';
import { useToolAvailability } from './useToolAvailability';
import { PdfActionType } from '../constants';
import { ToolConfig } from '../type';
import { getToolInfo } from '../utils';
import { getAvailableFeatures } from '../utils/getAvailableFeatures';
import { openEditPdfMode } from '../utils/openEditPdfMode';

export const useToolConfig = () => {
  const searchParams = useUrlSearchParams();
  const actionQuery = searchParams.get(UrlSearchParam.ACTION);

  const { toolName, featureName } = getToolInfo(actionQuery as PdfActionType);
  const applyOcr = useApplyOcrTool();
  const availableFeatures = getAvailableFeatures();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const { t } = useTranslation();
  const { isEnabled: canSummaryBaseOnDomain } = useEnableFeatureByDomain({
    enabledDomains: DOMAIN_WHITE_LIST.DOCUMENT_SUMMARIZATION,
  });
  const { enabled: isChatBotEnabled } = useEnabledChatBot();

  const { isToolAvailable, validateType } = getToolChecker({
    currentDocument,
    currentUser,
    toolName,
    translator: t,
    featureName,
  });

  const { handlePasswordProtection } = usePasswordProtectionTool({ actionQuery });
  const toolAvailabilityConfig = useToolAvailability({
    availableFeatures,
    validateType,
    isToolAvailable,
  });

  const toolConfigs: Record<string, ToolConfig> = {
    [TOOLS_NAME.CONTENT_EDIT]: {
      isAvailable:
        (availableFeatures.editPdf && validateType === FEATURE_VALIDATION.PREMIUM_FEATURE) || isToolAvailable,
      shouldCloseTabAtLimit: true,
      eventName: PremiumToolsPopOverEvent.EditPdf,
      handler: async () => {
        const isDocumentDigitalSigned = await verifyDocumentDigitalSigned();
        if (isDocumentDigitalSigned) {
          showDigitalSignatureModal();
          return;
        }
        openEditPdfMode();
      },
    },
    [TOOLS_NAME.FORM_BUILDER]: {
      isAvailable:
        (availableFeatures.formBuilder && validateType === FEATURE_VALIDATION.PREMIUM_FEATURE) || isToolAvailable,
      eventName: PremiumToolsPopOverEvent.FormBuilder,
      handler: () => {
        toggleFormFieldCreationMode(DataElements.FORM_BUILD_PANEL);
      },
    },
    [TOOLS_NAME.SPLIT_PAGE]: {
      isAvailable:
        (availableFeatures.splitPdf && validateType === FEATURE_VALIDATION.PREMIUM_FEATURE) || isToolAvailable,
      eventName: PremiumToolsPopOverEvent.SplitPage,
      handler: () => {},
    },
    [TOOLS_NAME.OCR]: {
      isAvailable: (availableFeatures.ocr && validateType === FEATURE_VALIDATION.PREMIUM_FEATURE) || isToolAvailable,
      eventName: PremiumToolsPopOverEvent.OCR,
      handler: applyOcr,
    },
    [TOOLS_NAME.DOCUMENT_SUMMARIZATION]: {
      isAvailable:
        (availableFeatures.summarization && validateType === FEATURE_VALIDATION.PREMIUM_FEATURE) ||
        isToolAvailable ||
        canSummaryBaseOnDomain,
      shouldCloseTabAtLimit: true,
      eventName: PremiumToolsPopOverEvent.SummarizeDocument,
      handler: () => {
        fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
          elementName: LayoutElements.SUMMARIZATION,
          isOpen: true,
        });
      },
    },
    [TOOLS_NAME.PASSWORD_PROTECTION]: {
      isAvailable: toolAvailabilityConfig[TOOLS_NAME.PASSWORD_PROTECTION].isAvailable,
      eventName: PremiumToolsPopOverEvent.PasswordProtection,
      handler: handlePasswordProtection,
    },
    [TOOLS_NAME.CHATBOT]: {
      isAvailable: isChatBotEnabled && isToolAvailable,
      handler: () => {
        fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
          elementName: LayoutElements.CHATBOT,
          isOpen: true,
        });
      },
    },
  };

  return (
    toolConfigs?.[toolName] || {
      isAvailable: isToolAvailable,
      handler: () => {},
    }
  );
};
