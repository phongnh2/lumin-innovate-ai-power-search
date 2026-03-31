import { useLocalStorage } from '@mantine/hooks';
import { get } from 'lodash';
import { useCallback } from 'react';

import { useTranslation } from 'hooks/useTranslation';

import organizationServices from 'services/organizationServices';

import getOrgIdOfDoc from 'helpers/getOrgIdOfDoc';

import { PaymentUrlSerializer } from 'utils/payment';

import { LocalStorageKey } from 'constants/localStorageKey';
import { PERIOD, Plans } from 'constants/plan';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';

type UseSetupFreeRequestsErrorPromptProps = {
  currentDocument: IDocumentBase;
  showRequestsLimitMessage: (props: { input: string; message: string }) => void;
};

export const useSetupFreeRequestsErrorPrompt = ({ currentDocument, showRequestsLimitMessage }: UseSetupFreeRequestsErrorPromptProps) => {
  const [reachedFreeRequestsLimit, setReachedFreeRequestsLimit] = useLocalStorage<boolean>({
    key: LocalStorageKey.HAS_REACHED_CHATBOT_FREE_REQUESTS_LIMIT,
    defaultValue: false,
  });
  const { t } = useTranslation();
  const orgOfDoc = get(currentDocument, 'documentReference.data', '') as IOrganization;
  const { userRole }: IOrganization = orgOfDoc || ({} as IOrganization);
  const isOrgManager = organizationServices.isManager(userRole);
  const orgId = getOrgIdOfDoc({ currentDocument });

  const getPaymentUrl = useCallback(() => {
    const paymentUrlSerializer = new PaymentUrlSerializer();
    return paymentUrlSerializer.of(orgId).plan(Plans.ORG_PRO).trial(false).period(PERIOD.ANNUAL).returnUrlParam().get();
  }, [orgId]);

  const getFreeRequestsLimitMessage = useCallback(
    () =>
      isOrgManager
        ? t('viewer.chatbot.requestsLimit.adminLifeTimeLimit', { paymentUrl: getPaymentUrl() })
        : t('viewer.chatbot.requestsLimit.memberLifeTimeLimit'),
    [isOrgManager, getPaymentUrl]
  );

  const setUpFreeRequestsErrorPrompt = useCallback(() => {
    if (!reachedFreeRequestsLimit) {
      setReachedFreeRequestsLimit(true);
    }
  }, [reachedFreeRequestsLimit]);

  const checkFreeRequestsLimit = useCallback(
    (input: string) => {
      if (reachedFreeRequestsLimit) {
        showRequestsLimitMessage({ input, message: getFreeRequestsLimitMessage() });
        return true;
      }

      return false;
    },
    [reachedFreeRequestsLimit, showRequestsLimitMessage, getFreeRequestsLimitMessage]
  );

  return {
    checkFreeRequestsLimit,
    getFreeRequestsLimitMessage,
    setUpFreeRequestsErrorPrompt,
  };
};
