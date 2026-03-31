import { IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import QRImage from 'assets/images/QR_Code_download_app.svg';

import useHandleDownloadMobileModal from '../../hooks/useHandleDownloadMobileModal';
import { ButtonSection, DialogSection, DividerSection } from '../BaseDownloadMobileModal';

import styles from './DownloadMobileModalVariantA.module.scss';

type Props = {
  onClose: () => void;
};

const DownloadMobileModalVariantA = ({ onClose }: Props) => {
  const { goToDownloadPage, onCloseModal } = useHandleDownloadMobileModal({ onClose });

  return (
    <DialogSection padding="md" onClose={onCloseModal}>
      <IconButton size="md" icon="x-md" className={styles.closeButton} onClick={onCloseModal} />
      <p className={styles.title}>Keep your work moving with our mobile app</p>
      <p className={styles.description}>
        Download the app to be notified of any updates to your documents wherever you go.
      </p>
      <div className={styles.content}>
        <img src={QRImage} alt="QR" className={styles.image} />
        <p className={styles.scanQR}>Scan this QR code with your phone camera</p>
        <DividerSection />
        <ButtonSection onClick={goToDownloadPage} />
      </div>
    </DialogSection>
  );
};

export default DownloadMobileModalVariantA;
