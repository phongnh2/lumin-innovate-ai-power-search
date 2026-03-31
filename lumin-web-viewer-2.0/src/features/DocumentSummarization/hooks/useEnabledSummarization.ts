/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { get } from 'lodash';
import { useParams } from 'react-router';

import selectors from 'selectors';

import { useEnableFeatureByDomain } from 'hooks/useEnableFeatureByDomain';
import { useNetworkStatus } from 'hooks/useNetworkStatus';
import { useShallowSelector } from 'hooks/useShallowSelector';

import { useEnabledChatBot } from 'features/EditorChatBot/hooks/useEnableChatBot';
import { useIsTempEditMode } from 'features/OpenForm/hooks/useIsTempEditMode';

import { DOMAIN_WHITE_LIST } from 'constants/customConstant';
import { Plans } from 'constants/plan';

import { OrganizationList } from 'interfaces/redux/organization.redux.interface';

export const useEnabledSummarization = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const {
    data: organizations,
    loading: isLoadingOrgs,
    error: fetchOrgError,
  } = useShallowSelector<OrganizationList>(selectors.getOrganizationList);

  const { enabled: canSummaryByPricing } = currentDocument?.premiumToolsInfo?.documentSummarization || {};

  const currentPlan = get(currentDocument, 'documentReference.data.payment.type', '');

  const { isOffline } = useNetworkStatus();
  const params = useParams<{ documentId: string }>();
  const isSystemFile = params.documentId?.startsWith('system');
  const { isTempEditMode } = useIsTempEditMode();

  const { enabled: enabledAIChatbot } = useEnabledChatBot();

  const { isEnabled: canSummaryBaseOnDomain } = useEnableFeatureByDomain({
    enabledDomains: DOMAIN_WHITE_LIST.DOCUMENT_SUMMARIZATION,
  });

  const canUpgradePlanForSharedDoc = () =>
    organizations.every((org) => [Plans.FREE, Plans.ORG_STARTER].includes(org.organization?.payment?.type));

  const canSummaryByDefault = !isOffline && !isSystemFile && !isTempEditMode && !enabledAIChatbot;

  const canSummaryBaseOnRole = () => {
    if (currentDocument?.isShared && !isLoadingOrgs && !fetchOrgError) {
      return canSummaryByDefault && (canSummaryByPricing || canUpgradePlanForSharedDoc());
    }
    return canSummaryByDefault && (currentPlan || canSummaryBaseOnDomain);
  };

  return {
    canSummary: canSummaryByPricing || canSummaryBaseOnDomain,
    showSummarizeHeader: canSummaryBaseOnRole(),
    showSummarizeRightSideBar: canSummaryByDefault && (canSummaryByPricing || canSummaryBaseOnDomain),
  };
};
