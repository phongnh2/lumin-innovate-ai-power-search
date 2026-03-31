import { Button, ButtonSize, ButtonVariant, Dialog } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';
import {
  PROMOTE_CHROME_EXTENSION_MODAL_VARIANT,
  useGetPromoteChromeExtensionModalFlag,
} from 'features/CNC/hooks/useGetPromoteChromeExtensionModalFlag';

import stylesBase from './BasePromoteChromeExtensionModal.module.scss';

type DialogSectionProps = {
  handleCloseModal: () => void;
  children: React.ReactNode;
};

type ButtonSectionProps = {
  handleCloseModal: () => void;
  handleGoToExtensionPage: () => void;
};

const DialogSection = ({ handleCloseModal, children }: DialogSectionProps) => (
  <Dialog
    opened
    centered
    size="sm"
    padding="md"
    onClose={handleCloseModal}
    closeOnClickOutside={false}
    closeOnEscape={false}
  >
    {children}
  </Dialog>
);

const ButtonSection = ({ handleCloseModal, handleGoToExtensionPage }: ButtonSectionProps) => {
  const { variant } = useGetPromoteChromeExtensionModalFlag();
  const isVariantA = variant === PROMOTE_CHROME_EXTENSION_MODAL_VARIANT.VARIANT_A;

  return (
    <div className={stylesBase.wrapButton}>
      <Button
        variant={ButtonVariant.text}
        size={ButtonSize.lg}
        className={stylesBase.leftButton}
        data-lumin-btn-name={CNCButtonName.DISMISS_PROMOTE_CHROME_EXTENSION_MODAL}
        data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.DISMISS_PROMOTE_CHROME_EXTENSION_MODAL]}
        onClick={() => handleCloseModal()}
      >
        Maybe later
      </Button>
      <Button
        variant={ButtonVariant.filled}
        size={ButtonSize.lg}
        className={stylesBase.rightButton}
        data-lumin-btn-name={CNCButtonName.GO_TO_CHROME_EXTENSION_PAGE}
        data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.GO_TO_CHROME_EXTENSION_PAGE]}
        onClick={() => handleGoToExtensionPage()}
      >
        {isVariantA ? 'Download free extension' : 'Install extension'}
      </Button>
    </div>
  );
};

export { DialogSection, ButtonSection };
