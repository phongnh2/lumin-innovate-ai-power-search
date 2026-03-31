import { Button, ButtonSize, ButtonVariant, Dialog } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useNavigate } from 'react-router';

import PromotingAppExtensionImage from 'assets/reskin/lumin-svgs/promoting-app-extension.svg';

import Icomoon from 'luminComponents/Icomoon';

import { isWindow10 } from 'helpers/device';

import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';
import { CNCModalName } from 'features/CNC/constants/events/modal';
import useTrackingABTestModalEvent from 'features/CNC/hooks/useTrackingABTestModalEvent';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { APP_DOWNLOAD } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';

import useGetHasShownDownloadDesktopModal from '../../hooks/useGeHasShownDownloadDesktopModal';

import styles from './DownloadDesktopAppModalVariantA.module.scss';

type Props = {
  onClose: () => void;
};
const DownloadDesktopAppModalVariantA = ({ onClose }: Props) => {
  const navigate = useNavigate();
  const { trackModalConfirmation, trackModalDismiss } = useTrackingABTestModalEvent({
    modalName: CNCModalName.DOWNLOAD_DESKTOP_APP_MODAL,
    hotjarEvent: HOTJAR_EVENT.DOWNLOAD_DESKTOP_APP_MODAL,
  });
  const { setOrgHasShownDownloadDesktopModal } = useGetHasShownDownloadDesktopModal();

  const handleClick = () => {
    trackModalConfirmation().catch(() => {});
    setOrgHasShownDownloadDesktopModal();
    if (isWindow10()) {
      window.open(APP_DOWNLOAD.MS_STORE);
    } else {
      navigate(Routers.DOWNLOAD);
    }
    onClose();
  };

  const handleClose = () => {
    setOrgHasShownDownloadDesktopModal();
    trackModalDismiss().catch(() => {});
    onClose();
  };

  return (
    <Dialog opened centered size="sm" padding="md" onClose={onClose} closeOnClickOutside={false} closeOnEscape={false}>
      <div className={styles.container}>
        <img src={PromotingAppExtensionImage} alt="AppExtensionImage" className={styles.img} />
        <p className={styles.title}>Install the desktop app</p>
        <div className={styles.wrapContent}>
          <p className={styles.description}>Our free desktop app lets you:</p>
          <div className={styles.content}>
            <Icomoon className="checkbox" color="var(--kiwi-colors-semantic-success)" size={24} />
            <p className={styles.subContent}>Open pdfs straight from your desktop.</p>
          </div>
          <div className={styles.content}>
            <Icomoon className="checkbox" color="var(--kiwi-colors-semantic-success)" size={24} />
            <p className={styles.subContent}>Keep your work in the cloud and your head out of it.</p>
          </div>
          <div className={styles.content}>
            <Icomoon className="checkbox" color="var(--kiwi-colors-semantic-success)" size={24} />
            <p className={styles.subContent}>Launch Lumin and focus on tasks with zero distractions.</p>
          </div>
        </div>
      </div>
      <div className={styles.wrapButton}>
        <Button
          variant={ButtonVariant.text}
          size={ButtonSize.lg}
          className={styles.leftButton}
          onClick={() => handleClose()}
        >
          Maybe later
        </Button>
        <Button
          variant={ButtonVariant.filled}
          size={ButtonSize.lg}
          className={styles.rightButton}
          data-lumin-btn-name={CNCButtonName.GO_TO_DOWNLOAD_DESKTOP_APP_PAGE}
          data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.GO_TO_DOWNLOAD_DESKTOP_APP_PAGE]}
          onClick={() => handleClick()}
        >
          Get the free app
        </Button>
      </div>
    </Dialog>
  );
};
export default DownloadDesktopAppModalVariantA;
