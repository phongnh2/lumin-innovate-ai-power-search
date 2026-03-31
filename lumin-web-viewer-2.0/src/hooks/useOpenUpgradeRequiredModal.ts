import { useDispatch } from 'react-redux';
import { To, useNavigate } from 'react-router';

import actions from 'actions';

import { ModalTypes } from 'constants/lumin-common';

import { useTrackingModalEvent } from './useTrackingModalEvent';
import { useTranslation } from './useTranslation';

const useOpenUpgradeRequiredModal = ({ modalName }: { modalName: string }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { trackModalConfirmation, trackModalDismiss, trackModalViewed } = useTrackingModalEvent({
    modalName,
  });
  const openModal = async (paymentUrl: To) => {
    const modalSettings = {
      type: ModalTypes.LUMIN,
      title: t('upgradeRequiredModal.title'),
      message: t('upgradeRequiredModal.message'),
      confirmButtonTitle: t('common.upgrade'),
      onConfirm: async () => {
        navigate(paymentUrl);
        await trackModalConfirmation();
      },
      onCancel: trackModalDismiss,
    };
    dispatch(actions.openModal(modalSettings));
    await trackModalViewed();
  };
  return { openModal };
};

export default useOpenUpgradeRequiredModal;
