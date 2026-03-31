import { isUndefined } from 'lodash';
import React, { useCallback, useContext } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { ShareModalContext } from 'luminComponents/ShareModal/ShareModalContext';
import { handleUpdateShareSettingDocument } from 'luminComponents/ShareSettingModal/utils';

import { useTranslation } from 'hooks';

import { preCheckShareDocumentInSlack, shareDocumentInSlack } from 'services/graphServices/slack';

import logger from 'helpers/logger';

import { errorUtils, eventTracking, toastUtils } from 'utils';
import modalEvent, { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';
import { SHARE_PERMISSION_MAPPING, WHO_CAN_OPEN_MAPPING } from 'utils/recordUtil';

import { SlackChannel, SlackConversationType } from 'features/ShareInSlack/interfaces/slack.interface';
import {
  setIsSharing,
  setIsSharingQueueProcessing,
  shareInSlackSelectors,
} from 'features/ShareInSlack/reducer/ShareInSlack.reducer';

import { documentStorage } from 'constants/documentConstants';
import { ErrorCode } from 'constants/errorCode';
import UserEventConstants from 'constants/eventConstants';
import { DOCUMENT_LINK_TYPE, LOGGER } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { SharingMode } from '../constants';

const METHOD_MAPPING = {
  [SharingMode.ANYONE]: 'publishDoc',
  [SharingMode.INVITED]: 'sharePrivate',
};

const modalEventData = {
  modalName: ModalName.OVERWRITE_OR_KEEP_PERMISSIONS,
};

const useHandleShareInSlack = ({
  message,
  onClose,
  setOpenedPermissionModal,
}: {
  message: string;
  onClose: () => void;
  setOpenedPermissionModal: (value: boolean) => void;
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isSharing = useSelector(shareInSlackSelectors.getIsSharing);
  const { selectedTeam, selectedDestination, sharingMode, accessLevel } = useSelector(
    shareInSlackSelectors.getFormData
  );
  // only document type is personal
  const { currentDocument, openHitDocStackModal, handleAllTransferFile, getSharees, updateDocument, isTransfering } =
    useContext(ShareModalContext) as {
      currentDocument: IDocumentBase;
      openHitDocStackModal: () => void;
      handleAllTransferFile: () => Promise<boolean>;
      getSharees: () => Promise<void>;
      updateDocument: (document: IDocumentBase) => void;
      isTransfering: boolean;
    };
  const getRecipient = useCallback(() => {
    if (!selectedDestination.isChannel) {
      return {
        shareInSlack_recipient: 'person',
        shareInSlack_recipient_size: 1,
      };
    }
    if ((selectedDestination as SlackChannel).isPrivate) {
      return {
        shareInSlack_recipient: 'privateChannel',
        shareInSlack_recipient_size: (selectedDestination as SlackChannel).totalMembers,
      };
    }
    return {
      shareInSlack_recipient: 'publicChannel',
      shareInSlack_recipient_size: (selectedDestination as SlackChannel).totalMembers,
    };
  }, [selectedDestination]);

  const trackShareSuccessEvent = useCallback(() => {
    const { shareInSlack_recipient, shareInSlack_recipient_size } = getRecipient();
    eventTracking(UserEventConstants.EventType.USER_SHARED_DOCUMENT, {
      docId: currentDocument._id,
      whoCanOpen: WHO_CAN_OPEN_MAPPING[sharingMode],
      permission: SHARE_PERMISSION_MAPPING[accessLevel],
      shareInSlack_message: Boolean(message),
      shareInSlack_method: METHOD_MAPPING[sharingMode],
      shareInSlack_recipient,
    },
    {
      shareInSlack_recipient_size,
    }).catch(() => {});
  }, [currentDocument, sharingMode, accessLevel, getRecipient, message]);

  const successMessage = useCallback((isChannel: boolean, isOverwritePermission?: boolean) => {
    if (isUndefined(isOverwritePermission)) {
      return t('shareInSlack.documentHasBeenShared');
    }
    if (isOverwritePermission) {
      return isChannel ? t('shareInSlack.overrideMultipleUsers') : t('shareInSlack.overrideSingleUser');
    }
    return isChannel ? t('shareInSlack.unChangeMultipleUsers') : t('shareInSlack.unChangeSingleUser');
  }, []);

  const shareDocument = async ({ isOverwritePermission }: { isOverwritePermission?: boolean } = {}) => {
    try {
      dispatch(setIsSharing(true));
      const isTransferFileSuccess = await handleAllTransferFile();
      if (!isTransferFileSuccess) {
        return;
      }
      const { hasUnshareableEmails, isQueuedSharing } = await shareDocumentInSlack({
        documentId: currentDocument._id,
        slackTeamId: selectedTeam?.id,
        conversation: {
          id: selectedDestination.id,
          type: selectedDestination.isChannel ? SlackConversationType.CHANNEL : SlackConversationType.DIRECT_MESSAGE,
          isPrivate: selectedDestination.isChannel && (selectedDestination as SlackChannel).isPrivate,
        },
        role: accessLevel.toUpperCase(),
        sharingMode,
        message,
        isOverwritePermission,
      });
      if (isQueuedSharing) {
        dispatch(setIsSharingQueueProcessing(true));
        toastUtils.info({ message: t('shareInSlack.documentSharingInProgress') });
      } else if (hasUnshareableEmails) {
        toastUtils.warn({
          message: (
            <Trans
              i18nKey="shareInSlack.sharingFailedForSomeUsersError"
              components={{ b: <b style={{ fontWeight: '700' }} /> }}
              values={{ docName: currentDocument.name }}
            />
          ),
        });
      } else {
        toastUtils.success({ message: successMessage(selectedDestination.isChannel, isOverwritePermission) });
      }
      trackShareSuccessEvent();
      await getSharees();
      if (sharingMode === SharingMode.ANYONE) {
        handleUpdateShareSettingDocument({
          currentDocument,
          updateDocument,
          updateShareSetting: {
            permission: accessLevel.toUpperCase(),
            linkType: DOCUMENT_LINK_TYPE.ANYONE,
          },
        });
      }
      onClose();
    } catch (error) {
      toastUtils.error({
        message: t('common.somethingWentWrong'),
      });
      logger.logError({
        reason: LOGGER.Service.SHARE_IN_SLACK,
        error: error as Error,
        message: 'Error sharing document',
      });
    } finally {
      dispatch(setIsSharing(false));
    }
  };

  const handleShare = async () => {
    try {
      dispatch(setIsSharing(true));
      if (currentDocument.service === documentStorage.s3) {
        const { isPermissionUpdateNeeded } = await preCheckShareDocumentInSlack({
          slackTeamId: selectedTeam?.id,
          conversation: {
            id: selectedDestination.id,
            type: selectedDestination.isChannel ? SlackConversationType.CHANNEL : SlackConversationType.DIRECT_MESSAGE,
          },
          documentId: currentDocument._id,
        });
        if (isPermissionUpdateNeeded) {
          setOpenedPermissionModal(true);
          modalEvent.modalViewed(modalEventData).catch(() => {});
          return;
        }
      }
      await shareDocument();
    } catch (error) {
      const { code: errorCode } = errorUtils.extractGqlError(error) as { code: string };
      if (errorCode === ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT) {
        openHitDocStackModal();
      } else {
        toastUtils.openUnknownErrorToast();
      }
      logger.logError({
        reason: LOGGER.Service.SHARE_IN_SLACK,
        error: error as Error,
        message: 'Error sharing document',
      });
    } finally {
      dispatch(setIsSharing(false));
    }
  };

  const handleConfirmPermissionModal = async () => {
    setOpenedPermissionModal(false);
    await shareDocument({ isOverwritePermission: false });
    modalEvent.modalConfirmation(modalEventData).catch(() => {});
  };

  const handleDismissPermissionModal = async () => {
    setOpenedPermissionModal(false);
    await shareDocument({ isOverwritePermission: true });
    modalEvent.modalDismiss(modalEventData).catch(() => {});
  };

  return {
    handleShare,
    isLoading: isTransfering || isSharing,
    handleConfirmPermissionModal,
    handleDismissPermissionModal,
  };
};

export default useHandleShareInSlack;
