import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { organizationServices } from 'services';
import { getOrganizationInviteLink } from 'services/graphServices/inviteLinkServices';

import logger from 'helpers/logger';

import { PaymentUtilities } from 'utils/Factory/Payment';

import { LOGGER } from 'constants/lumin-common';
import { InviteUsersSetting } from 'constants/organization.enum';
import { PaymentPlans } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { useInviteLinkAvailable } from './useInviteLinkAvailable';
import { InviteLink } from '../InviteLink.types';
import { setInviteLink, setCurrentInviteLink, setIsCurrentInviteLinkLoading } from '../reducer/InviteLink.reducer';

type UseFetchInviteLinkProps = {
  organizationData: IOrganization;
  withCurrentInviteLink?: boolean;
  enable?: boolean;
};

export const useFetchInviteLink = ({
  organizationData,
  withCurrentInviteLink = false,
  enable = true,
}: UseFetchInviteLinkProps) => {
  const dispatch = useDispatch();
  const { _id: organizationId } = organizationData || {};
  const isInviteLinkAvailable = useInviteLinkAvailable(organizationData);

  const [isLoading, setIsLoading] = useState(true);

  const shouldSkipFetchingInviteLink = () => {
    if (!isInviteLinkAvailable) {
      return true;
    }
    const isManager = organizationServices.isManager(organizationData.userRole);
    if (!isManager) {
      const { payment, settings } = organizationData;
      const paymentUtilities = new PaymentUtilities(payment);
      const isPremiumPlan = paymentUtilities.getPdfPaymentType() !== PaymentPlans.FREE;
      return isPremiumPlan || settings.inviteUsersSetting !== InviteUsersSetting.ANYONE_CAN_INVITE;
    }
    return false;
  };

  const setLoading = (value: boolean) => {
    if (withCurrentInviteLink) {
      dispatch(setIsCurrentInviteLinkLoading(value));
      return;
    }
    setIsLoading(value);
  };

  const setInviteLinkData = (data: InviteLink | null) => {
    if (withCurrentInviteLink) {
      dispatch(setCurrentInviteLink(data));
      return;
    }
    dispatch(setInviteLink(data));
  };

  useEffect(() => {
    if (!organizationId || !enable) {
      setLoading(false);
      return;
    }
    if (shouldSkipFetchingInviteLink()) {
      setInviteLinkData(null);
      setLoading(false);
      return;
    }
    const fetchInviteLink = async () => {
      setLoading(true);
      try {
        const inviteLinkData = await getOrganizationInviteLink({ orgId: organizationId });
        if (!inviteLinkData) {
          setInviteLinkData(null);
          setLoading(false);
          return;
        }
        const { _id, inviteId, isExpired, role, orgId, isExpiringSoon, expiresAt } = inviteLinkData;
        setInviteLinkData({
          _id,
          inviteId,
          isExpired,
          role,
          orgId,
          isExpiringSoon,
          expiresAt,
        });
      } catch (error) {
        setInviteLinkData(null);
        logger.logError({
          reason: LOGGER.Service.INVITE_LINK,
          message: 'Invite link fetch failed',
          error: error as Error,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInviteLink().finally(() => {});

    // eslint-disable-next-line consistent-return
    return () => {
      if (!withCurrentInviteLink) {
        dispatch(setInviteLink(null));
      }
    };
  }, [organizationId, isInviteLinkAvailable, withCurrentInviteLink, enable]);

  return { isLoading, isInviteLinkAvailable };
};
