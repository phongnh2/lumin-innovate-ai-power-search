import { useLocation } from 'react-router-dom';
import { get } from 'lodash';
import { ORGANIZATION_MAX_MEMBERS } from 'constants/organizationConstants';
import { UrlSearchParam } from 'constants/UrlSearchParam';
import { useMatchPaymentRoute } from 'hooks';
import { paymentUtil } from 'utils';
import { Plans } from 'constants/plan';

function useGetQuantity({ currentOrganization }) {
  const location = useLocation();
  const { plan } = useMatchPaymentRoute();
  const isOnOldBusinessPlan = plan === Plans.BUSINESS;

  if (isOnOldBusinessPlan) {
    const urlParams = new URLSearchParams(location.search);
    const quantityParam = Number(urlParams.get(UrlSearchParam.PAYMENT_ORG_QUANTITY));
    const minOrgPlanQuantity = paymentUtil.getQuantityInOrgOldPlan(currentOrganization);
    const isQuantityParamValid = quantityParam <= ORGANIZATION_MAX_MEMBERS && quantityParam >= minOrgPlanQuantity;
    const quantity = isQuantityParamValid ? quantityParam : minOrgPlanQuantity;
    return { quantity };
  }

  const quantity = get(currentOrganization, 'payment.quantity', 0);
  return { quantity };
}

export default useGetQuantity;
