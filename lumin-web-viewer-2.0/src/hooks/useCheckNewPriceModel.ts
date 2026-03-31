import { useGetValueNewPricesModel } from './growthBook/useGetValueNewPricesModel';
import useGetCurrentOrganization from './useGetCurrentOrganization';

const useCheckNewPriceModel = () => {
  const { variant: newPricingModelsVariant } = useGetValueNewPricesModel();
  const currentOrg = useGetCurrentOrganization();

  return {
    newPricingModelsVariant,
    // hide linear bar doc stack which new free tier, totalStack is 1000
    isHideDocStackBar: currentOrg?.docStackStorage?.totalStack === 1000,
  };
};

export { useCheckNewPriceModel };
