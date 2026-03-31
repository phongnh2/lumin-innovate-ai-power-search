import { Dialog, DialogProps, DialogPadding } from 'lumin-ui/kiwi-ui';
import React from 'react';

import AppleStoreImage from 'assets/lumin-svgs/apple-store.svg';
import GooglePlayImage from 'assets/lumin-svgs/google-play.svg';

import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';
import { useGetPromoteDownloadMobileAppFlag } from 'features/CNC/hooks';
import { VARIANT_PROMOTE_DOWNLOAD_MOBILE_APP } from 'features/CNC/hooks/useGetPromoteDownloadMobileAppFlag';

import { DOWNLOAD_PAGE } from '../../hooks/useHandleDownloadMobileModal';
import stylesVariantA from '../VariantA/DownloadMobileModalVariantA.module.scss';
import stylesVariantB from '../VariantB/DownloadMobileModalVariantB.module.scss';

type ButtonSectionProps = {
  onClick: (value: DOWNLOAD_PAGE) => void;
};

type DialogSectionProps = {
  padding: DialogProps['padding'];
  onClose: () => void;
  children: React.ReactNode;
};

const DialogSection = ({ padding, onClose, children }: DialogSectionProps) => {
  const getCustomProps = () => {
    if (Object.values(DialogPadding).includes(padding as DialogPadding)) {
      return { padding: padding as DialogPadding };
    }
    return {
      styles: {
        root: {
          '--modal-padding': padding,
        },
      },
    };
  };
  const customProps = getCustomProps();

  return (
    <Dialog
      opened
      centered
      size="sm"
      onClose={onClose}
      closeOnClickOutside={false}
      closeOnEscape={false}
      {...customProps}
    >
      {children}
    </Dialog>
  );
};

const ButtonSection = ({ onClick }: ButtonSectionProps) => {
  const { variant } = useGetPromoteDownloadMobileAppFlag();
  const styles = variant === VARIANT_PROMOTE_DOWNLOAD_MOBILE_APP.VARIANT_A ? stylesVariantA : stylesVariantB;

  return (
    <div className={styles.buttonWrapper}>
      <button
        id="download-on-app-store"
        onClick={() => onClick(DOWNLOAD_PAGE.APPLE_STORE)}
        className={styles.button}
        data-lumin-btn-name={CNCButtonName.GO_TO_APP_STORE_PAGE}
        data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.GO_TO_APP_STORE_PAGE]}
      >
        <img src={AppleStoreImage} alt="Download on Apple Store" />
      </button>
      <button
        id="download-on-google-play"
        onClick={() => onClick(DOWNLOAD_PAGE.GOOGLE_PLAY)}
        className={styles.button}
        data-lumin-btn-name={CNCButtonName.GO_TO_GOOGLE_PLAY_PAGE}
        data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.GO_TO_GOOGLE_PLAY_PAGE]}
      >
        <img src={GooglePlayImage} alt="Download on Google Play" />
      </button>
    </div>
  );
};

const DividerSection = () => {
  const { variant } = useGetPromoteDownloadMobileAppFlag();
  const styles = variant === VARIANT_PROMOTE_DOWNLOAD_MOBILE_APP.VARIANT_A ? stylesVariantA : stylesVariantB;

  return (
    <div className={styles.dividerWrapper}>
      <div className={styles.divider} />
      <p className={styles.or}>or</p>
      <div className={styles.divider} />
    </div>
  );
};

export { DialogSection, DividerSection, ButtonSection };
