import selectors from 'selectors';

import { OrganizationList } from 'interfaces/redux/organization.redux.interface';

import useShallowSelector from './useShallowSelector';

export const useEnableFeatureByDomain = ({ enabledDomains }: { enabledDomains: string[] }) => {
  const { data: organizations } = useShallowSelector<OrganizationList>(selectors.getOrganizationList);

  const organizationDomainMatchExists = (domain: string) =>
    organizations.some(
      (org) => org.organization.domain === domain || org.organization.associateDomains?.includes(domain)
    );

  const getMatchedDomain = () => {
    if (!organizations?.length) {
      return false;
    }

    return enabledDomains.some((domain) => organizationDomainMatchExists(domain));
  };

  return { isEnabled: getMatchedDomain() };
};
