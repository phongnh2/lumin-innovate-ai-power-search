import { useMemo } from 'react';

import { OrganizationUtilities } from 'utils/Factory/Organization';
import { PRICE, TEAM_CONVERT_TO_ORGANIZATION_PRICE } from 'constants/plan';
import { IOrganization } from 'interfaces/organization/organization.interface';

type Props = {
  plan: string;
  period: string;
  priceVersion: string;
  organization: IOrganization;
};

type Payload = {
  price: number;
};

const useGetPricingBaseOnPlan = ({ plan, period, priceVersion, organization }: Props): Payload => {
  const orgUtilities = useMemo(() => new OrganizationUtilities({ organization }), [organization]);
  const getPricing = (): number => {
    if (orgUtilities.isConvertedFromTeam()) {
      return (TEAM_CONVERT_TO_ORGANIZATION_PRICE as unknown as Record<string, number>)[period];
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return (PRICE as Record<string, any>)[priceVersion][period][plan];
  };
  return {
    price: getPricing(),
  };
};
export default useGetPricingBaseOnPlan;
