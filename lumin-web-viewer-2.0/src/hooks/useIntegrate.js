import { useDispatch } from 'react-redux';

import actions from 'actions';

import { saveLocalFile } from 'lumin-components/ViewerCommon/LocalSave/helper/saveLocalFile';

import { useTranslation } from 'hooks';
import { useTrackingModalEvent } from 'hooks/useTrackingModalEvent';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { eventTracking, file } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import UserEventConstants from 'constants/eventConstants';
import { INTEGRATE_BANANASIGN_BYTE_MAXIMUM } from 'constants/fileSize';
import { ModalTypes } from 'constants/lumin-common';
import { INTEGRATE_BUTTON_EVENT, INTEGRATE_LUMIN_SIGN_MODAL } from 'constants/luminSign';
import { Routers } from 'constants/Routers';
import toolsName from 'constants/toolsName';

export function useIntegrate() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const openViewerModal = (modalSettings) => dispatch(actions.openViewerModal(modalSettings));
  const { trackModalViewed } = useTrackingModalEvent({
    modalName: ModalName.CONFIRM_BANANASIGN_INTEGRATION,
    modalPurpose: ModalPurpose[ModalName.CONFIRM_BANANASIGN_INTEGRATION],
  });

  const handleAnonymousClickSendAndSignButton = () => {
    sessionStorage.setItem('targetDocumentURL', window.location.href);
    window.location.href = Routers.SIGNIN;
  };

  const openIntegrateLuminSignModal = () => {
    dispatch(actions.setShowIntegrateLuminSignModal(INTEGRATE_LUMIN_SIGN_MODAL.SIGN_MODAL, true));
  };

  const onIntegrate = ({ currentUser, currentDocument }) => {
    const hasReachedSizeLimit = currentDocument.size > INTEGRATE_BANANASIGN_BYTE_MAXIMUM;
    if (!currentUser) {
      handleAnonymousClickSendAndSignButton();
      return;
    }
    if (hasReachedSizeLimit) {
      eventTracking(UserEventConstants.EventType.CLICK, {
        elementName: ButtonName.SEND_AND_SIGN,
        SendDocIsOver20MB: hasReachedSizeLimit,
      });
      openViewerModal({
        type: ModalTypes.ERROR,
        message: t('viewer.bananaSign.errorMessageHasReachedSizeLimit', {
          size: file.getFileSizeLimit(INTEGRATE_BANANASIGN_BYTE_MAXIMUM),
        }),
        title: t('viewer.bananaSign.errorHasReachedSizeLimit'),
        confirmButtonTitle: t('common.gotIt'),
        cancelButtonTitle: null,
        footerVariant: 'variant2',
        onConfirm: () => {},
        size: 'small',
      });
      return;
    }
    trackModalViewed();
    const isUnsavedLocalFile = currentDocument.isSystemFile && currentDocument.unsaved;
    if (isUnsavedLocalFile) {
      openViewerModal({
        type: ModalTypes.WARNING,
        title: t('viewer.localFile.saveLocalFileTitle'),
        message: t('viewer.localFile.saveLocalFileMessage'),
        confirmButtonTitle: t('common.yes'),
        cancelButtonTitle: t('generalLayout.signAndSend.continueAnyway'),
        onConfirm: async () => {
          await saveLocalFile();
          openIntegrateLuminSignModal();
        },
        onCancel: () => {
          openIntegrateLuminSignModal();
        },
      });
      return;
    }
    openIntegrateLuminSignModal();
  };

  const onClickedIntegrate = ({ currentUser, currentDocument }) =>
    handlePromptCallback({
      callback: () =>
        onIntegrate({
          currentUser,
          currentDocument,
        }),
      applyForTool: toolsName.REDACTION,
      translator: t,
    });

  const handleEvent = (buttonName) => {
    const { eventType, ...arg } = INTEGRATE_BUTTON_EVENT[buttonName];
    eventTracking(eventType, arg);
  };

  return {
    onIntegrate,
    onClickedIntegrate,
    handleEvent,
  };
}
