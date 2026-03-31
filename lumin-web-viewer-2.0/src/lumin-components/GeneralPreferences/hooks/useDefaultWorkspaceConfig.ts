import { useMemo } from 'react';

import { useGetCurrentUser, useGetOrganizationList, useTranslation } from 'hooks';

import { PaymentPlans } from 'constants/plan.enum';

type DefaulWorkspaceConfig = {
  visibility: boolean;
  tooltip: string;
};

const useDefaultWorkspaceConfig = (): DefaulWorkspaceConfig => {
  const { t } = useTranslation();

  const { loading, organizationList } = useGetOrganizationList();
  const currentUser = useGetCurrentUser();

  return useMemo((): DefaulWorkspaceConfig => {
    if (!currentUser || loading) {
      return {
        visibility: false,
        tooltip: '',
      };
    }

    const isPremiumUser = currentUser.payment.type !== PaymentPlans.FREE;

    if (isPremiumUser) {
      return {
        visibility: organizationList.length > 0,
        tooltip: t('settingGeneral.defaultWorkspaceWithOrgsWarning'),
      };
    }

    return {
      visibility: true,
      tooltip: t('settingGeneral.defaultWorkspaceWarning'),
    };
  }, [currentUser, organizationList, loading]);
};

export default useDefaultWorkspaceConfig;
