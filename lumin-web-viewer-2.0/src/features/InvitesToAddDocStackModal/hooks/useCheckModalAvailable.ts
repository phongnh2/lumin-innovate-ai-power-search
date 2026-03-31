import { isEmpty } from 'lodash';

import { useGetValueNewPricesModel, NEW_PRICING_MODELS_VARIANT } from 'hooks/growthBook/useGetValueNewPricesModel';
import useGetOrganizationData from 'hooks/useGetOrganizationData';

import { OrganizationUtilities } from 'utils/Factory/Organization';

import { TOTAL_DOC_STACK_FREE_ORG } from 'constants/documentConstants';

const useCheckModalAvailable = (): { available: boolean } => {
  const organization = useGetOrganizationData();
  const { variant } = useGetValueNewPricesModel();

  if (isEmpty(organization) || !variant || variant !== NEW_PRICING_MODELS_VARIANT.VARIANT_E) {
    return {
      available: false,
    };
  }
  const orgUtilities = new OrganizationUtilities({ organization });

  if (!orgUtilities.payment.isFree() || !orgUtilities.hasInviteUsersPermission()) {
    return {
      available: false,
    };
  }

  const { totalStack = 0, totalUsed = 0 } = organization.docStackStorage || {};

  if (totalStack !== TOTAL_DOC_STACK_FREE_ORG || totalUsed !== TOTAL_DOC_STACK_FREE_ORG) {
    return { available: false };
  }

  return { available: true };
};

export default useCheckModalAvailable;
