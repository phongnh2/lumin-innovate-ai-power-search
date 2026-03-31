import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { v4 } from 'uuid';

import actions from 'actions';

import { useGetCurrentUser, useTranslation } from 'hooks';
import useUpdatesAvailableModal from 'hooks/useUpdatesAvailableModal';

import { organizationServices } from 'services';
import orgTracking from 'services/awsTracking/organizationTracking';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';
import { getDefaultOrgUrl, getTrendingUrl } from 'utils/orgUrlUtils';

import { ErrorCode } from 'constants/errorCode';
import { JOIN_ORGANIZATION_PERMISSION_TYPE, JOIN_ORGANIZATION_STATUS } from 'constants/organizationConstants';
import { Routers } from 'constants/Routers';

import { SuggestedPremiumOrganization } from 'interfaces/organization/organization.interface';

const useSubmit = ({ onSuccess }: { onSuccess: () => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useGetCurrentUser();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { open: openUpdatesAvailableModal } = useUpdatesAvailableModal();

  const handleSubmit = async (org: SuggestedPremiumOrganization) => {
    setIsSubmitting(true);
    const suggestId = v4();
    try {
      const { joinStatus, _id: orgId, paymentType, paymentPeriod, paymentStatus } = org;

      switch (joinStatus) {
        case JOIN_ORGANIZATION_STATUS.CAN_REQUEST: {
          const { newOrg } = await organizationServices.sendRequestJoinOrg({ orgId });
          toastUtils.success({ message: t('joinOrgs.requestSubmitted') }).finally(() => {});

          orgTracking.trackSelectSuggestedOrganization({
            position: 1,
            suggestId,
            suggestedOrganizationId: orgId,
            permissionType: JOIN_ORGANIZATION_PERMISSION_TYPE.REQUEST_ACCESS,
            paymentType,
            paymentStatus,
            paymentPeriod,
          });

          if (newOrg) {
            dispatch(actions.addNewOrganization(newOrg));
            dispatch(actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: newOrg.url }));
            navigate(getDefaultOrgUrl({ orgUrl: newOrg.url }));
            break;
          }

          navigate(Routers.ROOT);
          break;
        }
        case JOIN_ORGANIZATION_STATUS.CAN_JOIN: {
          const { organization } = await organizationServices.joinOrganization({ orgId });
          toastUtils.success({ message: t('joinOrgs.joinSuccessfully') }).finally(() => {});

          orgTracking.trackSelectSuggestedOrganization({
            position: 1,
            suggestId,
            suggestedOrganizationId: orgId,
            permissionType: JOIN_ORGANIZATION_PERMISSION_TYPE.JOIN,
            paymentType,
            paymentStatus,
            paymentPeriod,
          });

          dispatch(actions.addNewOrganization(organization));
          if (!currentUser.hasJoinedOrg) {
            dispatch(actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: organization.url }));
          }

          navigate(getTrendingUrl({ orgUrl: organization.url }));
          break;
        }
        case JOIN_ORGANIZATION_STATUS.PENDING_INVITE: {
          const { organization } = await organizationServices.acceptOrganizationInvitation({ orgId });
          toastUtils.success({ message: t('joinOrgs.inviteAccepted') }).finally(() => {});

          dispatch(actions.addNewOrganization(organization));
          if (!currentUser.hasJoinedOrg) {
            dispatch(actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: organization.url }));
          }

          navigate(getDefaultOrgUrl({ orgUrl: organization.url }));
          break;
        }
        default:
          break;
      }
    } catch (err) {
      const { message, code } = errorUtils.extractGqlError(err) as { message: string; code: string };
      logger.logError({ error: err, message });
      if (code === ErrorCode.Org.ALREADY_REQUEST_TO_JOIN_ORG) {
        openUpdatesAvailableModal();
        return;
      }
      if (errorUtils.handleScimBlockedError(err)) {
        return;
      }
      toastUtils.error({ message: t('joinOrg.somethingWentWrong') }).finally(() => {});
    } finally {
      setIsSubmitting(false);
      onSuccess();
    }
  };

  return { isSubmitting, handleSubmit };
};

export { useSubmit };

export default useSubmit;
