import React from 'react';

import useGetReactivateModalFlag from 'hooks/growthBook/featureflags/useGetReactivateModalFlag';
import useOpenTrialModal from 'hooks/useOpenTrialModal';

import BillingModal from 'features/BillingModal';
import DownloadMobileModal from 'features/CNC/CncComponents/DownloadMobileModal';
import ReactivateModal from 'features/CNC/CncComponents/ReactivateModal';
import { useOpenDownloadMobileModal, useOpenPromoteChromeExtensionModal } from 'features/CNC/hooks';
import { useOpenDownloadDesktopAppModal } from 'features/CNC/hooks/useOpenDownloadDesktopAppModal';

import { IOrganization } from 'interfaces/organization/organization.interface';

import CheckoutModal from '../CheckoutModal/CheckoutModal';
import DownloadDesktopAppModal from '../DownloadDesktopAppModal';
import PromoteChromeExtensionModal from '../PromoteChromeExtensionModal';
import TrialModal from '../TrialModal/TrialModal';

const ModalManager = ({ organization }: { organization: IOrganization }) => {
  const { canShowModal: canShowReactiveAccountModal } = useGetReactivateModalFlag();
  const {
    open: openTrialModal,
    onClose,
    onClickStartTrial,
    trackModalConfirmation,
    isVariantModal,
    isVariantPopover,
    setOpenBillingModal,
  } = useOpenTrialModal({ currentOrg: organization });
  const { open: openDownloadMobileModal } = useOpenDownloadMobileModal();
  const { open: openDesktopAppModal } = useOpenDownloadDesktopAppModal();
  const { open: openPromoteChromeExtension } = useOpenPromoteChromeExtensionModal();

  if (canShowReactiveAccountModal && organization) {
    return <ReactivateModal organization={organization} />;
  }

  if (isVariantModal) {
    return <CheckoutModal organization={organization} setOpenBillingModal={setOpenBillingModal} />;
  }

  if (isVariantPopover) {
    return <BillingModal organization={organization} setOpenBillingModal={setOpenBillingModal} />;
  }

  if (openTrialModal) {
    return (
      <TrialModal
        trackModalConfirmation={trackModalConfirmation}
        openTrialModal={openTrialModal}
        onClose={onClose}
        onClickStartTrial={onClickStartTrial}
      />
    );
  }

  if (openDesktopAppModal) {
    return <DownloadDesktopAppModal />;
  }

  if (openDownloadMobileModal) {
    return <DownloadMobileModal />;
  }

  if (openPromoteChromeExtension) {
    return <PromoteChromeExtensionModal />;
  }

  return null;
};

export default ModalManager;
