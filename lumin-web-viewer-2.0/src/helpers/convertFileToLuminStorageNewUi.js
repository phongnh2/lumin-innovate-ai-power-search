import get from 'lodash/get';

import { store } from 'src/redux/store';

import actions from 'actions';

import { documentServices, organizationServices } from 'services';
import PersonalDocumentUploadService from 'services/personalDocumentUploadService';

import { socketUtil, getFileService } from 'utils';
import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import { PaymentUrlSerializer } from 'utils/payment';

import { MAXIMUM_FILE_SIZE, ModalTypes } from 'constants/lumin-common';
import { ERROR_MESSAGE_DOCUMENT } from 'constants/messages';
import { Plans, PERIOD } from 'constants/plan';

const onCancelBtn = () => {
  modalEvent.modalDismiss({
    modalName: ModalName.UPGRADE_DOCUMENT_SIZE,
    modalPurpose: ModalPurpose[ModalName.UPGRADE_DOCUMENT_SIZE],
  });
};

const trackUpgradeModal = (callback = () => {}) => {
  modalEvent.modalConfirmation({
    modalName: ModalName.UPGRADE_DOCUMENT_SIZE,
    modalPurpose: ModalPurpose[ModalName.UPGRADE_DOCUMENT_SIZE],
  });
  callback();
};

const convertTitle = 'convertFileModal.title';

export default async ({ document, history, forceReload, t, renderContentModalConvert }) => {
  const paymentUrlSerializer = new PaymentUrlSerializer();
  const { dispatch } = store;
  try {
    if (!document) {
      return;
    }
    const currentOrganization = get(document, 'documentReference.data', {});
    const isFreeOrg = get(currentOrganization, 'payment.type', '') === Plans.FREE;
    const isOverSizeFreePlan = isFreeOrg && document.size >= MAXIMUM_FILE_SIZE.FREE_PLAN * 1024 * 1024;
    if (document.size >= MAXIMUM_FILE_SIZE.PREMIUM_PLAN * 1024 * 1024) {
      dispatch(
        actions.openViewerModal({
          title: t(convertTitle),
          message: renderContentModalConvert(MAXIMUM_FILE_SIZE.PREMIUM_PLAN),
          size: 'small',
          confirmButtonTitle: t('common.gotIt'),
          cancelButtonTitle: '',
          onConfirm: () => {},
          footerVariant: 'variant2',
        })
      );
      return;
    }
    if (isOverSizeFreePlan) {
      const canStartBusinessTrial = get(currentOrganization, 'payment.trialInfo.canUseBusinessTrial', false);
      const canStartProTrial = get(currentOrganization, 'payment.trialInfo.canUseProTrial', false);
      const byAction =
        canStartProTrial || canStartBusinessTrial
          ? t('convertFileModal.action.startFreeTrial')
          : t('convertFileModal.action.upgradePlan');
      const isManager = organizationServices.isManager(currentOrganization?.userRole);
      if (isManager) {
        const managerModalSettings = {
          title: t(convertTitle),
          message: renderContentModalConvert(MAXIMUM_FILE_SIZE.FREE_PLAN, byAction),
          size: 'small',
          modalEventData: {
            modalName: ModalName.LEAVE_EDIT_MODE_AND_SAVE_CHANGES,
            modalPurpose: ModalPurpose[ModalName.LEAVE_EDIT_MODE_AND_SAVE_CHANGES],
          },
          cancelButtonTitle: t('convertFileModal.later'),
          onCancel: onCancelBtn,
          footerVariant: 'variant1',
        };
        const confirmButtonData =
          canStartBusinessTrial || canStartProTrial
            ? {
                confirmButtonTitle: t('common.startFreeTrial'),
                onConfirm: () =>
                  navigateToStartTrial({ history, paymentUrlSerializer, canStartProTrial, currentOrganization }),
              }
            : {
                confirmButtonTitle: t('common.upgradePlan'),
                onConfirm: () => navigateToUpgradePlan({ history, paymentUrlSerializer, currentOrganization }),
              };
        dispatch(
          actions.openViewerModal({
            ...managerModalSettings,
            ...confirmButtonData,
          })
        );
      } else {
        dispatch(
          actions.openViewerModal({
            title: t(convertTitle),
            message: renderContentModalConvert(MAXIMUM_FILE_SIZE.FREE_PLAN, byAction),
            size: 'small',
            confirmButtonTitle: t('common.gotIt'),
            cancelButtonTitle: '',
            onConfirm: () => {},
            footerVariant: 'variant2',
          })
        );
      }
      return;
    }
    const uploader = new PersonalDocumentUploadService();
    const { workspaceId } = document.belongsTo;
    const { _id: documentId, remoteId, service } = document;
    const file = await getFileService.getFileGoogleService(document);
    const { encodedUploadData } = await documentServices.uploadDocumentWithThumbnailToS3({ file });
    await uploader.upload({
      documentId,
      encodedUploadData,
      fileName: file.name,
      orgId: workspaceId,
    });
    socketUtil.socketEmitSendUpdateDocument(documentId, { remoteId, service });
    forceReload && window.location.reload();
  } catch (error) {
    dispatch(
      actions.openViewerModal({
        type: ModalTypes.ERROR,
        title: t(convertTitle),
        message: t(ERROR_MESSAGE_DOCUMENT.UPLOAD_FILE),
      })
    );
  }
};
function navigateToUpgradePlan({ history, paymentUrlSerializer, currentOrganization }) {
  return trackUpgradeModal(() => history(
    paymentUrlSerializer
      .trial(false)
      .plan(Plans.ORG_PRO)
      .of(currentOrganization._id)
      .period(PERIOD.ANNUAL)
      .get()
  )
  );
}

function navigateToStartTrial({ history, paymentUrlSerializer, canStartProTrial, currentOrganization }) {
  return trackUpgradeModal(() =>
    history(
      paymentUrlSerializer
        .trial(true)
        .plan(canStartProTrial ? Plans.ORG_PRO : Plans.ORG_BUSINESS)
        .of(currentOrganization._id)
        .period(PERIOD.ANNUAL)
        .get()
    )
  );
}
