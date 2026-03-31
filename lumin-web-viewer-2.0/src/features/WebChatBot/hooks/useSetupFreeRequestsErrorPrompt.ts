import { useLocalStorage } from '@mantine/hooks';
import { useCallback, useMemo } from 'react';

import { useGetCurrentOrganization } from 'hooks';
import { useTranslation } from 'hooks/useTranslation';

import organizationServices from 'services/organizationServices';

import { PaymentUrlSerializer } from 'utils/payment';

import { LocalStorageKey } from 'constants/localStorageKey';
import { PERIOD, Plans } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';

type UseSetupFreeRequestsErrorPromptProps = {
  showRequestsLimitMessage: (props: { input: string; message: string }) => void;
};

export const useSetupFreeRequestsErrorPrompt = ({ showRequestsLimitMessage }: UseSetupFreeRequestsErrorPromptProps) => {
  const [reachedFreeRequestsLimit, setReachedFreeRequestsLimit] = useLocalStorage<boolean>({
    key: LocalStorageKey.HAS_REACHED_CHATBOT_FREE_REQUESTS_LIMIT,
    defaultValue: false,
  });
  const { t } = useTranslation();
  const currentOrganization = useGetCurrentOrganization();
  const { _id: orgId, userRole }: IOrganization = currentOrganization || ({} as IOrganization);
  const isOrgManager = organizationServices.isManager(userRole);

  const getPaymentUrl = useCallback(() => {
    const paymentUrlSerializer = new PaymentUrlSerializer();
    return paymentUrlSerializer.of(orgId).plan(Plans.ORG_PRO).trial(false).period(PERIOD.ANNUAL).returnUrlParam().get();
  }, [orgId]);

  const adminMessage = useMemo(
    () => t('viewer.chatbot.requestsLimit.adminLifeTimeLimit', { paymentUrl: getPaymentUrl() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getPaymentUrl]
  );

  const getFreeRequestsLimitMessage = useCallback(
    () => (isOrgManager ? adminMessage : t('viewer.chatbot.requestsLimit.memberLifeTimeLimit')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOrgManager, adminMessage]
  );

  const setUpFreeRequestsErrorPrompt = useCallback(() => {
    if (!reachedFreeRequestsLimit) {
      setReachedFreeRequestsLimit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
