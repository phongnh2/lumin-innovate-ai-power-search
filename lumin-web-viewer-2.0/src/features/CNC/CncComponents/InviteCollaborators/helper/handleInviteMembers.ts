import { TFunction } from 'i18next';
import { NavigateFunction } from 'react-router';
import { Dispatch, AnyAction } from 'redux';

import actions from 'actions';

import { UsePromptInviteUsersBannerHandlerData } from 'luminComponents/PromptInviteUsersBanner/hooks/usePromptInviteUsersHandler';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';

import { CNCModalName } from 'features/CNC/constants/events/modal';
import showContactCustomerSupportModal from 'features/CNC/helpers/showContactCustomerSupportModal';
import showJoinedOrganizationModal from 'features/CNC/helpers/showJoinedOrganizationModal';

import { CTAEventValues, InviteActionTypes } from 'constants/featureFlagsConstant';
import { ORG_TEXT } from 'constants/organizationConstants';

import { IOrganization, InviteToOrganizationInput } from 'interfaces/organization/organization.interface';

type handleInviteMembersProps = {
  members: InviteToOrganizationInput[];
  currentOrganization: IOrganization;
  onSkip: ({ replace }: { replace: boolean }) => void;
  dispatch: Dispatch<AnyAction>;
  setIsSubmitting: (isSubmitting: boolean) => void;
  navigate: NavigateFunction;
  t: TFunction;
  from?: string;
  getPromptGoogleUsersHandler: UsePromptInviteUsersBannerHandlerData['getPromptGoogleUsersHandler'];
  shouldOpenContactCustomerSupportModal?: boolean;
};

export const handleInviteMembers = async ({
  members,
  currentOrganization,
  onSkip,
  dispatch,
  setIsSubmitting,
  navigate,
  t,
  from = '',
  getPromptGoogleUsersHandler,
  shouldOpenContactCustomerSupportModal = false,
}: handleInviteMembersProps) => {
  setIsSubmitting(true);
  const isInviteFromCollaboratorsModal = from === CNCModalName.INVITE_MEMBER_TO_WORKSPACE;
  try {
    if (members.length) {
      await organizationServices.inviteMemberToOrg({
        orgId: currentOrganization._id,
        members,
        invitedFrom: isInviteFromCollaboratorsModal
          ? CTAEventValues[InviteActionTypes.INVITE_COLLABORATORS_MODAL]
          : CTAEventValues[InviteActionTypes.JOIN_ORGANIZATION_FROM_OPEN_DRIVE],
      });
    }
    if (!isInviteFromCollaboratorsModal) {
      navigate(`/${ORG_TEXT}/${currentOrganization.url}/documents/personal`, { replace: true });
    }
  } catch (error: unknown) {
    const { message } = errorUtils.extractGqlError(error) as { message: string; code: string };
    errorUtils.handleScimBlockedError(error);
    logger.logError({ message, error });
  } finally {
    setIsSubmitting(false);
    onSkip({ replace: false });
    toastUtils
      .success({
        message: t('setUpOrg.invitationSent', { numInvitation: members.length }),
        useReskinToast: true,
      })
      .catch(() => {});
    showJoinedOrganizationModal({
      organization: currentOrganization,
      numberInvited: members?.length,
      dispatch,
    });
    if (isInviteFromCollaboratorsModal) {
      dispatch(actions.setShouldShowInviteCollaboratorsModal(false) as AnyAction);
      if (shouldOpenContactCustomerSupportModal) {
        showContactCustomerSupportModal({
          numberInvited: members?.length,
        });
      }
    }
    getPromptGoogleUsersHandler({ orgId: currentOrganization._id, forceUpdate: true }).catch(() => {});
  }
};
