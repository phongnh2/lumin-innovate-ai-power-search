import React, { useEffect } from 'react';

import { useTrackingModalEvent } from 'hooks/useTrackingModalEvent';

import { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { INTEGRATE_LUMIN_SIGN_MODAL } from 'constants/luminSign';

const SignerViewerModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/SignerViewerModal'));

type IntegrateLuminModalProps = {
  isOpenLuminSignModal: boolean;
  closeIntegrateModal: (modalNaml: string) => void;
};

export default function IntegrateLuminModal({
  isOpenLuminSignModal,
  closeIntegrateModal,
}: IntegrateLuminModalProps): JSX.Element {
  const { trackModalConfirmation }: { trackModalConfirmation: () => void; trackModalDismiss: () => void } =
    useTrackingModalEvent({
      modalName: ModalName.CONFIRM_BANANASIGN_INTEGRATION,
      modalPurpose: ModalPurpose[ModalName.CONFIRM_BANANASIGN_INTEGRATION],
    });

  const onCloseSignModal = (): void => {
    closeIntegrateModal(INTEGRATE_LUMIN_SIGN_MODAL.SIGN_MODAL);
  };

  useEffect((): void => {
    if (isOpenLuminSignModal) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      trackModalConfirmation();
    }
  }, [isOpenLuminSignModal]);

  if (!isOpenLuminSignModal) {
    return null;
  }
  return <SignerViewerModal open={isOpenLuminSignModal} handleClose={onCloseSignModal} />;
}
