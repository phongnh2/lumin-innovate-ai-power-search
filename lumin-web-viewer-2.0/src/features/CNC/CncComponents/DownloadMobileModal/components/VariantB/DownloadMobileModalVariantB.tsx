import { IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import DownloadMobile from 'assets/images/download-mobile.png';
import QRImage from 'assets/images/QR_Code_download_app.svg';

import useHandleDownloadMobileModal from '../../hooks/useHandleDownloadMobileModal';
import { ButtonSection, DialogSection, DividerSection } from '../BaseDownloadMobileModal';

import styles from './DownloadMobileModalVariantB.module.scss';

type Props = {
  onClose: () => void;
};

const DownloadMobileModalVariantB = ({ onClose }: Props) => {
  const { goToDownloadPage, onCloseModal } = useHandleDownloadMobileModal({ onClose });

  return (
    <DialogSection padding="none" onClose={onCloseModal}>
      <IconButton size="md" icon="x-md" className={styles.closeButton} onClick={onCloseModal} />
      <div className={styles.thumbnailWrapper}>
        <img src={DownloadMobile} alt="DownloadMobile" className={styles.thumbnail} />
      </div>
      <div className={styles.wrapper}>
        <p className={styles.title}>Keep your work moving with our mobile app</p>
        <p className={styles.description}>Lumin's free mobile app is here:</p>
        <div className={styles.content}>
          <img src={QRImage} alt="QR" className={styles.QRImage} />
          <div>
            <p className={styles.scanQR}>Scan this QR code with your phone camera</p>
            <DividerSection />
            <ButtonSection onClick={goToDownloadPage} />
          </div>
        </div>
      </div>
    </DialogSection>
  );
};

export default DownloadMobileModalVariantB;
