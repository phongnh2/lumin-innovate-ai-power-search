import { useEffect, useMemo, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import organizationServices from 'services/organizationServices';

import logger from 'helpers/logger';

import { numberUtils, toastUtils } from 'utils';
import { OrganizationUtilities } from 'utils/Factory/Organization';

const useGetEnterprisePrice = () => {
  const [{ monthlyPrice, annualPrice }, setPrice] = useState({
    monthly: 0,
    annual: 0,
  });
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const { payment = {}, _id: orgId } = currentOrganization || {};
  const orgUtilities = useMemo(
    () => new OrganizationUtilities({ organization: currentOrganization }),
    [currentOrganization]
  );
  const { type: paymentType } = payment;
  useEffect(() => {
    if (orgId && orgUtilities.isManager() && orgUtilities.payment.isEnterprise()) {
      organizationServices.getOrganizationPrice(orgId)
        .then(({ interval, pricePerUnit }) => {
          const price = pricePerUnit / 100;
          switch (interval) {
            case 'year':
              setPrice({ annual: price, monthly: numberUtils.formatTwoDigits(price / 12) });
              break;
            case 'month':
              setPrice({ annual: price * 12, monthly: price });
              break;
            default:
              break;
          }
        })
        .catch((err) => {
          logger.logError({ error: err });
          toastUtils.openUnknownErrorToast();
        });
    }
  }, [paymentType, orgId, orgUtilities]);

  return [monthlyPrice, annualPrice];
};

export default useGetEnterprisePrice;
