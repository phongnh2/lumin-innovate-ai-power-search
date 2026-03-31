import { useTranslation } from 'react-i18next';

import selectors from 'selectors';

import { useEnableFeatureByDomain } from 'hooks/useEnableFeatureByDomain';
import useShallowSelector from 'hooks/useShallowSelector';

import { getToolChecker } from 'helpers/getToolPopper';

import { DOMAIN_WHITE_LIST } from 'constants/customConstant';
import { FEATURE_VALIDATION } from 'constants/lumin-common';

import { mapExploredFeatureToToolName, PdfAction } from '../constants';
import { PdfActionType } from '../type';
import { getToolInfo } from '../utils';
import { getAvailableFeatures } from '../utils/getAvailableFeatures';

export const useCheckExploringFeature = ({ pdfAction }: { pdfAction: PdfActionType }) => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const { t } = useTranslation();
  const availableFeatures = getAvailableFeatures();
  const toolInfo = getToolInfo(pdfAction);
  const { isEnabled: canSummaryBaseOnDomain } = useEnableFeatureByDomain({
    enabledDomains: DOMAIN_WHITE_LIST.DOCUMENT_SUMMARIZATION,
  });

  const featureKey = mapExploredFeatureToToolName.get(pdfAction);
  const { validateType } = getToolChecker({
    currentDocument,
    currentUser,
    toolName: toolInfo?.toolName,
    translator: t,
  });

  if (pdfAction === PdfAction.SUMMARIZATION && canSummaryBaseOnDomain) {
    return false;
  }

  return validateType === FEATURE_VALIDATION.PREMIUM_FEATURE && availableFeatures[featureKey];
};
