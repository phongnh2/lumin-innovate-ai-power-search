import { useState } from 'react';
import { batch, useDispatch } from 'react-redux';

import actions from 'actions';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { commonUtils, errorUtils, toastUtils } from 'utils';

import { CNCModalName } from 'features/CNC/constants/events/modal';
import useTrackingABTestModalEvent from 'features/CNC/hooks/useTrackingABTestModalEvent';

import { TOAST_DURATION_ERROR_INVITE_MEMBER } from 'constants/customConstant';
import { ErrorCode } from 'constants/errorCode';
import { InviteActionTypes } from 'constants/featureFlagsConstant';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { ModalTypes, STATUS_CODE } from 'constants/lumin-common';
import { WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER } from 'constants/messages';
import { OrganizationRoles } from 'constants/organization.enum';
import { NEW_PRICING_PLAN_LIST, PLAN_TYPE } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';

type UserTagType = {
  _id: string;
  email: string;
  name: string;
};

type Props = {
  organization: IOrganization;
  userTags: UserTagType[];
  onClose: () => void;
  setShowDiscardModal: (value: boolean) => void;
  handleResetShareModalList: () => void;
};

const useHandleInviteSharedUsersModal = ({
  organization,
  userTags,
  onClose,
  setShowDiscardModal,
  handleResetShareModalList,
}: Props) => {
  const [role, setRole] = useState(OrganizationRoles.MEMBER);
  const [users, setUsers] = useState(userTags);
  const [inviting, setInviting] = useState(false);
  const { _id: orgId } = organization;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { trackModalConfirmation, trackModalDismiss } = useTrackingABTestModalEvent({
    modalName: CNCModalName.INVITE_SHARED_USERS_MODAL,
    hotjarEvent: HOTJAR_EVENT.INVITE_SHARED_USERS_MODAL,
  });

  const handleDelete = (params: UserTagType) => {
    setUsers((prev) => prev.filter((tag) => tag.email !== params.email));
  };

  const hasEmailIncluded = (_email: string) => (target: { email: string }) => target.email === _email;

  const transformDataToSend = (list: UserTagType[]) =>
    list.map((item) => ({ _id: item._id, email: item.email, role: role.toUpperCase() }));

  const handleSuccessToast = ({
    statusCode,
    sameDomainEmails,
    notSameDomainEmails,
  }: {
    statusCode: number;
    sameDomainEmails: string[];
    notSameDomainEmails: string[];
  }) => {
    switch (statusCode) {
      case STATUS_CODE.SUCCEED:
        if (sameDomainEmails.length && !notSameDomainEmails.length) {
          toastUtils.success({
            message: 'Member(s) have been added.',
            useReskinToast: true,
          });
          return;
        }

        if (sameDomainEmails.length && notSameDomainEmails.length) {
          toastUtils.success({
            message: `Member(s) with ${commonUtils.getDomainFromEmail(
              sameDomainEmails[0]
            )} have been added while the other recipients will be added to your ${t('organization', {
              ns: 'terms',
            })} when they accept the invites.`,
            useReskinToast: true,
          });
          return;
        }

        toastUtils.success({
          message: `Invite(s) have been sent. When the recipient accepts, they will be added to your ${t(
            'organization',
            { ns: 'terms' }
          )}.`,
          useReskinToast: true,
        });

        break;
      case STATUS_CODE.BAD_REQUEST:
        toastUtils.warn({
          message: t(WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER),
          duration: TOAST_DURATION_ERROR_INVITE_MEMBER,
          useReskinToast: true,
        });
        break;
      default:
        break;
    }
  };

  const handleInvite = async () => {
    if (![...NEW_PRICING_PLAN_LIST, PLAN_TYPE.FREE].includes(organization.payment?.type)) {
      return;
    }

    trackModalConfirmation().catch(() => {});
    try {
      setInviting(true);
      const memberList = transformDataToSend(users);
      const {
        organization: _organization,
        statusCode,
        sameDomainEmails,
        notSameDomainEmails,
      } = await organizationServices.inviteMemberToOrg({
        orgId,
        members: memberList,
        invitedFrom: InviteActionTypes.ADD_SHARED_USERS_MODAL,
      });
      batch(() => {
        dispatch(actions.updateCurrentOrganization(_organization));
        dispatch(actions.updateOrganizationInList(orgId, _organization));
      });
      handleSuccessToast({ statusCode, sameDomainEmails, notSameDomainEmails });
      setShowDiscardModal(false);
      onClose();
    } catch (err) {
      const { code: errorCode } = errorUtils.extractGqlError(err) as { code: string };
      if (errorUtils.handleScimBlockedError(err)) {
        return;
      }
      if (errorCode === ErrorCode.Org.CANNOT_INVITE_USER) {
        dispatch(
          actions.openModal({
            type: ModalTypes.WARNING,
            title: 'Cannot perform this action',
            message:
              'The invite permissions of your Circle has just changed to Circle Administrators. Reload to be up-to-date.',
            confirmButtonTitle: 'Reload',
            onConfirm: () => window.location.reload(),
            useReskinModal: true,
          })
        );
        return;
      }
    } finally {
      handleResetShareModalList();
      setInviting(false);
    }
  };

  const handleDismiss = () => {
    trackModalDismiss().catch(() => {});
    setShowDiscardModal(false);
    onClose();
  };

  return {
    users,
    role,
    setRole,
    inviting,
    handleDelete,
    hasEmailIncluded,
    handleInvite,
    handleDismiss,
    canRemoveUserTag: users.length > 1,
  };
};

export default useHandleInviteSharedUsersModal;
