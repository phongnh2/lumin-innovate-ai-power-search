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

export default async ({ document, history, forceReload, t }) => {
  const paymentUrlSerializer = new PaymentUrlSerializer();

  const titleModal = t('convertFileModal.title');
  const { dispatch } = store;
  try {
    if (!document) {
      return;
    }
    const currentOrganization = get(document, 'documentReference.data', {});
    const isFreeOrg = get(currentOrganization, 'payment.type', '') === Plans.FREE;
    const isOverSizeFreePlan = (fileSize) => isFreeOrg && fileSize >= MAXIMUM_FILE_SIZE.FREE_PLAN * 1024 * 1024;
    if (document.size >= MAXIMUM_FILE_SIZE.PREMIUM_PLAN * 1024 * 1024) {
      dispatch(actions.openViewerModal({
        type: ModalTypes.WARNING,
        title: titleModal,
        boldMessage: document.name,
        message: t('convertFileModal.documentOverUploadSizeOfPremiumUser', { sizeLimit: MAXIMUM_FILE_SIZE.PREMIUM_PLAN }),
        confirmButtonTitle: t('common.gotIt'),
        onConfirm: () => {},
      }));
      return;
    }
    if (isOverSizeFreePlan(document.size)) {
      const canStartBusinessTrial = get(currentOrganization, 'payment.trialInfo.canUseBusinessTrial', false);
      const canStartProTrial = get(currentOrganization, 'payment.trialInfo.canUseProTrial', false);
      const byAction = canStartProTrial || canStartBusinessTrial
        ? t('convertFileModal.action.startFreeTrial')
        : t('convertFileModal.action.upgradePlan');
      const isManager = organizationServices.isManager(currentOrganization?.userRole);
      if (isManager) {
        const managerModalSettings = {
          type: ModalTypes.WARNING,
          title: titleModal,
          message: `${t('convertFileModal.documentOverUploadSizeOfFreeUser', { sizeLimit: MAXIMUM_FILE_SIZE.FREE_PLAN })} ${t('convertFileModal.upgradeMessage', {
            action: byAction,
          })}`,
          modalEventData: {
            modalName: ModalName.LEAVE_EDIT_MODE_AND_SAVE_CHANGES,
            modalPurpose: ModalPurpose[ModalName.LEAVE_EDIT_MODE_AND_SAVE_CHANGES],
          },
          cancelButtonTitle: t("convertFileModal.later"),
          onCancel: onCancelBtn,
        };
        if (canStartBusinessTrial || canStartProTrial) {
          dispatch(
            actions.openViewerModal({
              ...managerModalSettings,
              confirmButtonTitle: t('common.startFreeTrial'),
              onConfirm: () =>
                trackUpgradeModal(() =>
                  history(
                    paymentUrlSerializer
                      .trial(true)
                      .plan(canStartProTrial ? Plans.ORG_PRO : Plans.ORG_BUSINESS)
                      .of(currentOrganization._id)
                      .period(PERIOD.ANNUAL)
                      .returnUrlParam()
                      .get()
                  )
                ),
          }));
        } else {
          dispatch(actions.openViewerModal({
            ...managerModalSettings,
            confirmButtonTitle: t("convertFileModal.upgrade"),
            onConfirm: () =>
              trackUpgradeModal(() => history(
                paymentUrlSerializer
                  .trial(false)
                  .plan(Plans.ORG_PRO)
                  .of(currentOrganization._id)
                  .period(PERIOD.ANNUAL)
                  .returnUrlParam()
                  .get()
              )),
          }));
        }
      } else {
        dispatch(actions.openViewerModal({
          type: ModalTypes.WARNING,
          title: titleModal,
          message: `${t('convertFileModal.documentOverUploadSizeOfFreeUser', { sizeLimit: MAXIMUM_FILE_SIZE.FREE_PLAN })} ${t(
              'convertFileModal.requestUpgradeMessage',
              { action: byAction }
            )}`,
          confirmButtonTitle: t('common.gotIt'),
          onConfirm: () => {},
        }));
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
    dispatch(actions.openViewerModal({
      type: ModalTypes.ERROR,
      title: titleModal,
      message: t(ERROR_MESSAGE_DOCUMENT.UPLOAD_FILE),
    }));
  };
};
