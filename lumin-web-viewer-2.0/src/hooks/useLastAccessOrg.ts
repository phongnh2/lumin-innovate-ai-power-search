import { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import logger from 'helpers/logger';

import { PaymentPlans } from 'constants/plan.enum';

import { IUser } from 'interfaces/user/user.interface';

import useGetOrganizationList from './useGetOrganizationList';

function useLastAccessOrg(): string {
  const { migratedOrgUrl, lastAccessedOrgUrl, payment } = useSelector<unknown, IUser>(
    selectors.getCurrentUser,
    shallowEqual
  );
  const { organizationList } = useGetOrganizationList();

  /**
   * For verifying this bug https://lumin.atlassian.net/browse/LP-5774
   */
  useEffect(() => {
    if (!lastAccessedOrgUrl && payment.type === PaymentPlans.FREE) {
      logger.logError({ message: 'Organization url must not be null' });
    }
  }, [lastAccessedOrgUrl, payment.type]);

  return migratedOrgUrl || lastAccessedOrgUrl || organizationList[0]?.organization?.url;
}

export default useLastAccessOrg;
