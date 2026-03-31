import { useEffect, useState } from 'react';

import { useGetCurrentUser, useGetOrganizationList, useMatchPaymentRoute } from 'hooks';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { socket } from '@socket';

import { LOGGER } from 'constants/lumin-common';
import { PaymentPlans } from 'constants/plan.enum';
import { SOCKET_ON } from 'constants/socketConstant';

import {
  IOrganization,
  JoinOrganizationStatus,
  SuggestedPremiumOrganization,
} from 'interfaces/organization/organization.interface';

export const useCheckModalAvailable = (): {
  available: boolean;
  organization: SuggestedPremiumOrganization | null;
  setAvailable: (value: boolean) => void;
} => {
  const [organization, setOrganization] = useState<SuggestedPremiumOrganization | null>(null);

  const currentUser = useGetCurrentUser();
  const { organizationList } = useGetOrganizationList();
  const { isPaymentPage } = useMatchPaymentRoute();

  const setAvailable = (value: boolean) => {
    setOrganization(value ? organization : null);
  };

  const handleCheckModalAvailable = async ({
    organization: orgData,
    userId,
  }: {
    organization: IOrganization;
    userId: string;
  }) => {
    try {
      if (organization || currentUser._id === userId) {
        return;
      }
      const isUnallowedAutoJoin = orgData.unallowedAutoJoin.includes(currentUser._id);
      const hasJoinedOrg = Boolean(organizationList.find((orgItem) => orgItem.organization._id === orgData._id));

      if (hasJoinedOrg || isUnallowedAutoJoin) {
        return;
      }
      const orgWithJoinStatus = await organizationServices.getOrganizationWithJoinStatus(orgData._id);

      if (
        [
          JoinOrganizationStatus.CAN_JOIN,
          JoinOrganizationStatus.CAN_REQUEST,
          JoinOrganizationStatus.PENDING_INVITE,
        ].includes(orgWithJoinStatus.joinStatus)
      ) {
        setOrganization({ ...orgData, ...orgWithJoinStatus });
      }
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.PROMPT_TO_JOIN_TRIALING_ORG,
        error: error as Error,
        message: 'Error displaying Prompt To Join Trialing Org Modal',
      });
    }
  };

  useEffect(() => {
    if (currentUser?._id && organizationList.length && !isPaymentPage) {
      const hasPremiumPlanOrg = organizationList.some(
        (orgItem) => orgItem.organization.payment?.type !== PaymentPlans.FREE
      );

      if (!hasPremiumPlanOrg) {
        socket.on(SOCKET_ON.PROMPT_TO_JOIN_TRIALING_ORG, handleCheckModalAvailable);
      }
    }

    return () => {
      socket.removeListener({
        message: SOCKET_ON.PROMPT_TO_JOIN_TRIALING_ORG,
        listener: handleCheckModalAvailable,
      });
    };
  }, [currentUser?._id, organizationList, isPaymentPage]);

  return {
    available: Boolean(organization),
    setAvailable,
    organization,
  };
};

export default useCheckModalAvailable;
