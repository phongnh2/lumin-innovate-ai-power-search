import { useEffect, useState } from 'react';

import { userServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils } from 'utils';
import { makeCancelable } from 'utils/makeCancelable';

import { SuggestedOrganization } from 'interfaces/organization/organization.interface';

const useGetSuggestedOrgListOfUser = () => {
  const [loading, setLoading] = useState(true);
  const [orgList, setOrgList] = useState<SuggestedOrganization[]>([]);

  useEffect(() => {
    const { promise, cancel } = makeCancelable(userServices.getSuggestedOrgListOfUser);
    const fetchSuggestedPremiumOrgListOfUser = async () => {
      try {
        const suggestedOrgList = await promise();
        setOrgList(suggestedOrgList);
      } catch (error: unknown) {
        const { message } = errorUtils.extractGqlError(error) as { message: string };
        logger.logError({ message, error });
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestedPremiumOrgListOfUser().catch(() => {});
    return () => {
      cancel();
    };
  }, []);

  return {
    orgList,
    loading,
  };
};

export { useGetSuggestedOrgListOfUser };
