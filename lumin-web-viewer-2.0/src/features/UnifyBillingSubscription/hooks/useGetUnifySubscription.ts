import { useCallback, useEffect, useState } from 'react';

import useRestrictBillingActions from 'hooks/useRestrictBillingActions';

import { paymentServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils } from 'utils';
import { PaymentUtilities } from 'utils/Factory/Payment';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { defaultSubscription, useUnifyBillingSubscriptionStore } from './useUnifyBillingSubscriptionStore';

type UseGetUnifySubscriptionProps = {
  clientId: string;
  type: string;
  organization: IOrganization;
};

const useGetUnifySubscription = ({ clientId, type, organization }: UseGetUnifySubscriptionProps) => {
  const paymentUtilities = new PaymentUtilities(organization?.payment);
  const isUnifyFree = paymentUtilities.isUnifyFree();

  const { isRestrictedOrg } = useRestrictBillingActions({ orgId: clientId });

  const isPreventFetching = isUnifyFree || isRestrictedOrg;

  const [isFetching, setIsFetching] = useState(!isPreventFetching);

  const { setUnifyBillingSubscriptionData } = useUnifyBillingSubscriptionStore();

  const getUnifySubscription = useCallback(async () => {
    if (isUnifyFree) {
      setUnifyBillingSubscriptionData({
        subscription: defaultSubscription,
        upcomingInvoice: null,
      });
      setIsFetching(false);
      return;
    }
    setIsFetching(true);
    try {
      const response = await paymentServices.getUnifySubscription({ clientId, type });
      setUnifyBillingSubscriptionData(response);
    } catch (error) {
      const { message } = errorUtils.extractGqlError(error as Error) as { message: string };
      logger.logError({ error: error as Error, message, reason: 'getUnifySubscription failed' });
    } finally {
      setIsFetching(false);
    }
  }, [clientId, type]);

  useEffect(() => {
    if (isRestrictedOrg) {
      return;
    }
    getUnifySubscription().finally(() => {});
  }, [getUnifySubscription, isRestrictedOrg]);

  return {
    isPreventFetching,
    isFetching,
    setIsFetching,
  };
};

export default useGetUnifySubscription;
