import { useContext, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';
import { RootState } from 'store';

import FreeTrialContext from 'lumin-components/OrganizationFreeTrial/FreeTrialContext';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, eventTracking, toastUtils } from 'utils';

import { CNC_LOCAL_STORAGE_KEY } from 'features/CNC/constants/customConstant';
import { CNCUserEvent } from 'features/CNC/constants/events/user';
import showContactCustomerSupportModal from 'features/CNC/helpers/showContactCustomerSupportModal';
import { useShowContactCustomerSupportModal } from 'features/CNC/hooks';

import { TOAST_DURATION_ERROR_INVITE_MEMBER } from 'constants/customConstant';
import { CTAEventValues, InviteActionTypes } from 'constants/featureFlagsConstant';
import { LOGGER, STATUS_CODE } from 'constants/lumin-common';
import { ExtraTrialDaysOrganizationAction } from 'constants/organization.enum';
import { ORGANIZATION_ROLES, ORG_TEXT } from 'constants/organizationConstants';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import {
  IOrganization,
  InviteToOrganizationInput,
  OrganizationMemberInvitation,
} from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

type Params = {
  selectedUsers: InviteToOrganizationInput[];
  onClose: () => void;
  trackModalConfirmation: () => Promise<void>;
  trackModalDismiss: () => Promise<void>;
  userCollaborators: IUserResult[];
  isExtraTrial: boolean;
};

const useInviteMembers = ({
  selectedUsers,
  onClose,
  trackModalConfirmation,
  trackModalDismiss,
  userCollaborators,
  isExtraTrial,
}: Params) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInviting, setIsInviting] = useState(false);
  const [isAddingFreeTrialDays, setIsAddingFreeTrialDays] = useState(false);
  const { t } = useTranslation();
  const params = new URLSearchParams(location.search);
  const returnUrl = params.get(UrlSearchParam.RETURN_URL);

  const { billingInfo } = useContext(FreeTrialContext);
  const { organizationId } = billingInfo as { organizationId: string };
  const { organization: selectedOrganization } =
    useSelector<unknown, { organization: IOrganization }>(
      (state) => selectors.getOrganizationById(state as RootState, organizationId),
      shallowEqual
    ) || {};

  const { shouldOpenContactCustomerSupportModal } = useShowContactCustomerSupportModal({
    organization: selectedOrganization,
    numberInvited: selectedUsers.length,
  });

  const handleRedirect = () => {
    const orgPageUrl = `/${ORG_TEXT}/${selectedOrganization.url}/documents`;
    navigate(returnUrl || orgPageUrl);
  };

  const extendFreeTrial = async ({ invitations }: { invitations: OrganizationMemberInvitation[] }) => {
    setIsAddingFreeTrialDays(true);
    try {
      const extendedDays = invitations.length < 30 ? invitations.length : 30;
      await organizationServices.extraTrialDaysOrganization({
        orgId: organizationId,
        days: extendedDays,
        action: ExtraTrialDaysOrganizationAction.INVITE_MEMBER,
      });
      eventTracking(CNCUserEvent.EXTEND_FREE_TRIAL, {
        numberSuggestedUsers: userCollaborators.length,
        numberInvitedUsers: invitations.length,
        numberInvitedUsersFromSharedList: selectedUsers.length,
      }).catch(() => {});
      toastUtils.success({ message: `Added ${extendedDays} day(s) to your free trial.` });
    } catch (err) {
      logger.logError({
        reason: LOGGER.Service.COMMON_ERROR,
        error: err as Error,
        message: 'Failed to extend free trial days',
      });
    } finally {
      setIsAddingFreeTrialDays(false);
    }
  };

  const getMembersToInvite = (): InviteToOrganizationInput[] =>
    selectedUsers.map((user) => ({
      _id: user._id,
      email: user.email,
      role: ORGANIZATION_ROLES.MEMBER,
    }));

  const inviteMembers = async () => {
    setIsInviting(true);
    const members = getMembersToInvite();
    try {
      const { invitations, statusCode } = await organizationServices.inviteMemberToOrg({
        orgId: organizationId,
        members,
        invitedFrom: CTAEventValues[InviteActionTypes.MODAL_EXTRA_FREE_TRIAL_DAYS],
        extraTrial: true,
      });

      if (statusCode === STATUS_CODE.BAD_REQUEST) {
        toastUtils.error({ message: 'Some members cannot be invited', duration: TOAST_DURATION_ERROR_INVITE_MEMBER });
      }

      return { invitations };
    } catch (err) {
      if (!errorUtils.handleScimBlockedError(err)) {
        toastUtils.error({ message: 'Failed to invite members to organization' }).finally(() => {});
      }

      logger.logError({
        reason: LOGGER.Service.COMMON_ERROR,
        error: err as Error,
        message: 'Failed to invite members to organization',
      });

      return { invitations: [] };
    } finally {
      if (!isExtraTrial && members.length) {
        toastUtils.success({
          message: t('setUpOrg.invitationSent', { numInvitation: members.length }),
          useReskinToast: true,
        });
      }
      setIsInviting(false);
    }
  };

  const onInvite = async () => {
    trackModalConfirmation().catch(() => {});
    const { invitations } = await inviteMembers();
    if (!invitations.length) {
      return;
    }
    if (isExtraTrial) {
      await extendFreeTrial({ invitations });
    }

    const invitedEmails = new Set(invitations.map((invitation) => invitation.memberEmail));
    let storedCollaborators: IUserResult[] = [];
    try {
      storedCollaborators = JSON.parse(
        localStorage.getItem(CNC_LOCAL_STORAGE_KEY.DRIVE_COLLABORATORS_NOT_IN_CIRCLE) || '[]'
      ) as IUserResult[];
    } catch (err) {
      logger.logError({
        reason: LOGGER.Service.COMMON_ERROR,
        error: err as Error,
        message: 'Failed to parse stored collaborators from localStorage',
      });
      storedCollaborators = [];
    }
    const filteredCollaborators = storedCollaborators.filter((collaborator) => !invitedEmails.has(collaborator.email));
    localStorage.setItem(
      CNC_LOCAL_STORAGE_KEY.DRIVE_COLLABORATORS_NOT_IN_CIRCLE,
      JSON.stringify(filteredCollaborators)
    );
    dispatch(actions.updateCurrentUser({ hasJoinedOrg: true }));
    onClose();
    handleRedirect();
    if (shouldOpenContactCustomerSupportModal) {
      showContactCustomerSupportModal({
        numberInvited: invitations?.length,
      });
    }
  };

  const onCloseModal = () => {
    trackModalDismiss().catch(() => {});
    onClose();
    handleRedirect();
  };

  return { loading: isInviting || isAddingFreeTrialDays, onInvite, onCloseModal, handleRedirect };
};

export default useInviteMembers;
