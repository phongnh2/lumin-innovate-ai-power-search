import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import organizationTracking from 'services/awsTracking/organizationTracking';

import logger from 'helpers/logger';

import { errorUtils } from 'utils';
import { makeCancelable } from 'utils/makeCancelable';

import { getSuggestedPremiumOrgListOfUser } from 'features/CNC/services/organization';

import { OrganizationTypes } from 'constants/organization.enum';
import { DomainVisibilitySetting } from 'constants/organizationConstants';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { SuggestedPremiumOrganization } from 'interfaces/organization/organization.interface';

const useGetSuggestedOrgList = ({ suggestId }: { suggestId?: string }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get(UrlSearchParam.ORG_TYPE);
  const [loading, setLoading] = useState(true);
  const [premiumOrgList, setPremiumOrgList] = useState<SuggestedPremiumOrganization[]>([]);

  useEffect(() => {
    if (!Object.values(OrganizationTypes).includes(type as OrganizationTypes)) {
      searchParams.delete(UrlSearchParam.ORG_TYPE);
      setSearchParams(searchParams, { replace: true });
    }
    const { promise, cancel } = makeCancelable(async () => getSuggestedPremiumOrgListOfUser());
    const fetchSuggestedPremiumOrgListOfUser = async () => {
      try {
        const orgList = await promise();
        setPremiumOrgList(orgList);
        organizationTracking.trackSuggestedOrganizationsToJoinOverall({
          suggestId,
          recommendedOrganizationsCount: orgList.length,
          recommendedPaidOrganizationsCount: orgList.length,
        });
        orgList.forEach((organization, position) => {
          const {
            _id: suggestedOrganizationId,
            paymentStatus,
            paymentPeriod,
            paymentType,
            domainVisibility,
          } = organization;
          organizationTracking.trackSuggestedOrganizationsToJoinDetail({
            suggestId,
            position,
            suggestedOrganizationId,
            paymentType,
            paymentStatus,
            paymentPeriod,
            visibility: DomainVisibilitySetting[domainVisibility],
          });
        });
      } catch (error: unknown) {
        const { message } = errorUtils.extractGqlError(error) as { message: string };
        logger.logError({ error, message });
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
    premiumOrgList,
    loading,
    setPremiumOrgList,
  };
};

export { useGetSuggestedOrgList };
