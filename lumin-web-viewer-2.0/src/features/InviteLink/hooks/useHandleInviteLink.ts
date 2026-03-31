import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';
import {
  regenerateOrganizationInviteLink,
  deleteOrganizationInviteLink,
} from 'services/graphServices/inviteLinkServices';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';
import { RegenerateInviteLinkTrigger } from 'utils/Factory/EventCollection/constants/InviteLinkEvent';
import { InviteLinkEventCollection } from 'utils/Factory/EventCollection/InviteLinkEventCollection';
import modalEvent, { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';

import { LOGGER, ModalTypes, TIMEOUT } from 'constants/lumin-common';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import useGetInviteLinkData from './useGetInviteLinkData';
import { setInviteLink } from '../reducer/InviteLink.reducer';
import { getInviteLinkUrl } from '../utils';

const calculateDaysUntilExpiration = (expiresAt: string | Date): number => {
  const expirationDate = new Date(expiresAt).getTime();
  const currentDate = Date.now();
  const millisecondsInDay = 1000 * 60 * 60 * 24;
  const daysUntilExpiration = Math.ceil((expirationDate - currentDate) / millisecondsInDay);
  return daysUntilExpiration > 0 ? daysUntilExpiration : 0;
};

const useHandleInviteLink = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { inviteLink: currentInviteLink, selectedOrg: currentOrganization } = useGetInviteLinkData();
  const { t } = useTranslation();
  const isManager = organizationServices.isManager(currentOrganization.userRole);
  const copyTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isCopy, setIsCopy] = useState(false);

  const regenerateInviteLink = async (role?: string) => {
    setLoading(true);
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      })
    );
    try {
      const inviteLinkData = await regenerateOrganizationInviteLink({
        orgId: currentOrganization._id,
        role: role || currentInviteLink.role,
      });
      dispatch(
        setInviteLink({
          _id: inviteLinkData._id,
          inviteId: inviteLinkData.inviteId,
          isExpired: inviteLinkData.isExpired,
          isExpiringSoon: inviteLinkData.isExpiringSoon,
          role: inviteLinkData.role,
          orgId: inviteLinkData.orgId,
          expiresAt: inviteLinkData.expiresAt,
        })
      );

      const inviteLinkEvents = new InviteLinkEventCollection({
        inviteLinkID: inviteLinkData._id,
        invitedRole: inviteLinkData.role,
        workspaceID: currentOrganization._id,
        actorRole: currentOrganization.userRole,
        expireIn: calculateDaysUntilExpiration(inviteLinkData.expiresAt),
      });
      inviteLinkEvents
        .regenerateInviteLink({
          invitedRole: role || currentInviteLink.role,
          trigger: role ? RegenerateInviteLinkTrigger.CHANGING_ROLE : RegenerateInviteLinkTrigger.MANUALLY,
        })
        .catch(() => {});
      toastUtils.success({ message: t('inviteLink.newInviteLinkGenerated') });
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.INVITE_LINK,
        message: 'Regenerate invite link failed',
        error: error as Error,
      });
      errorUtils.handleScimBlockedError(error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    const inviteLinkEvents = new InviteLinkEventCollection({
      inviteLinkID: currentInviteLink._id,
      invitedRole: currentInviteLink.role,
      workspaceID: currentOrganization._id,
      actorRole: currentOrganization.userRole,
      expireIn: calculateDaysUntilExpiration(currentInviteLink.expiresAt),
    });
    inviteLinkEvents.copyInviteLink().catch(() => {});
    await navigator.clipboard.writeText(getInviteLinkUrl(currentInviteLink.inviteId));
    if (currentInviteLink.isExpiringSoon) {
      toastUtils.warn({
        message: isManager ? t('inviteLink.copyLinkWarning') : t('inviteLink.copyLinkWaringForMember'),
      });
    } else {
      toastUtils.success({
        message: t('inviteLink.copyLinkSuccess'),
      });
    }
    setIsCopy(true);
    copyTimeout.current = setTimeout(() => {
      setIsCopy(false);
    }, TIMEOUT.COPY);
  };

  const deactivateInviteLink = async () => {
    try {
      setLoading(true);
      dispatch(
        actions.updateModalProperties({
          isProcessing: true,
          disableBackdropClick: true,
          disableEscapeKeyDown: true,
        })
      );
      await deleteOrganizationInviteLink(currentOrganization._id);
      dispatch(setInviteLink(null));
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.INVITE_LINK,
        message: 'Deactivate invite link failed',
        error: error as Error,
      });
    } finally {
      setLoading(false);
    }
  };

  const onClickRegenerateInviteLink = () => {
    const trackingData = {
      modalName: ModalName.CONFIRM_RESET_INVITE_LINK,
    };
    modalEvent.modalViewed(trackingData).catch(() => {});
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('regenerateLink.title'),
      message: currentInviteLink.isExpired
        ? t('regenerateLink.descriptionForExpiredLink')
        : t('regenerateLink.description'),
      useReskinModal: true,
      confirmButtonTitle: t('inviteLink.regenerateLink'),
      onConfirm: async () => {
        await regenerateInviteLink();
        modalEvent.modalConfirmation(trackingData).catch(() => {});
      },
      onCancel: () => {},
    };
    dispatch(actions.openModal(modalSettings));
  };

  const onClickDeactivateInviteLink = () => {
    const trackingData = {
      modalName: ModalName.CONFIRM_DEACTIVATE_INVITE_LINK,
    };
    modalEvent.modalViewed(trackingData).catch(() => {});
    dispatch(
      actions.openModal({
        type: ModalTypes.WARNING,
        title: t('deactivateLink.title'),
        message: t('deactivateLink.description'),
        useReskinModal: true,
        confirmButtonTitle: t('inviteLink.deactivateLink'),
        onConfirm: async () => {
          await deactivateInviteLink();
          modalEvent.modalConfirmation(trackingData).catch(() => {});
        },
        onCancel: () => {},
      })
    );
  };

  const onClickChangeRole = (role: string) => {
    const trackingData = {
      modalName: ModalName.CONFIRM_CHANGE_ROLE_INVITE_LINK,
    };
    modalEvent.modalViewed(trackingData).catch(() => {});
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('changeInvitedRole.title'),
      message: currentInviteLink.isExpired
        ? t('changeInvitedRole.descriptionForExpiredLink')
        : t('changeInvitedRole.description'),
      useReskinModal: true,
      confirmButtonTitle: t('common.change'),
      onConfirm: async () => {
        await regenerateInviteLink(role);
        modalEvent.modalConfirmation(trackingData).catch(() => {});
      },
      onCancel: () => {},
    };
    dispatch(actions.openModal(modalSettings));
  };

  const roleIsMember = currentInviteLink?.role.toUpperCase() === ORGANIZATION_ROLES.MEMBER;

  useEffect(() => () => clearTimeout(copyTimeout.current), []);

  return {
    regenerateInviteLink,
    onClickRegenerateInviteLink,
    copyInviteLink,
    loading,
    isManager,
    currentInviteLink,
    isCopy,
    roleIsMember,
    onClickDeactivateInviteLink,
    onClickChangeRole,
  };
};

export default useHandleInviteLink;
