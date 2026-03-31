import React, { MutableRefObject, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import IconButton from '@new-ui/general-components/IconButton';
import Popper from '@new-ui/general-components/Popper';

import GoogleIllustrationDark from 'assets/images/drive-file-preparation-google-dark.png';
import GoogleIllustrationLight from 'assets/images/drive-file-preparation-google-light.png';
import MicrosoftIllustrationDark from 'assets/images/drive-file-preparation-microsoft-dark.png';
import MicrosoftllustrationLight from 'assets/images/drive-file-preparation-microsoft-light.png';

import selectors from 'selectors';

import { useThemeMode } from 'hooks/useThemeMode';

import { LOGIN_SERVICE_TO_WORDING } from 'constants/authConstant';

import { GuestModeSignInProvider } from './constant';

import styles from './DriveFilePreparationGuide.module.scss';

interface DriveFilePreparationGuideProps {
  anchorEl: MutableRefObject<HTMLElement>;
  email: string;
  hintLoginService: keyof typeof LOGIN_SERVICE_TO_WORDING;
  provider: string;
}

const DriveFilePreparationGuide = ({ anchorEl, email, hintLoginService, provider }: DriveFilePreparationGuideProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(Boolean(email));
  const isLoadingDocument = useSelector(selectors.isLoadingDocument);
  const themeMode = useThemeMode();
  const getPreparationGuideImg = () => {
    switch (provider) {
      case GuestModeSignInProvider.Google:
        return themeMode === 'light' ? GoogleIllustrationLight : GoogleIllustrationDark;
      case GuestModeSignInProvider.Microsoft:
        return themeMode === 'light' ? MicrosoftllustrationLight : MicrosoftIllustrationDark;
      default:
        return '';
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Popper
      open={open && Boolean(anchorEl.current) && !isLoadingDocument}
      anchorEl={anchorEl.current}
      placement="bottom"
      paperProps={{
        rounded: 'large',
        elevation: 2,
      }}
      hasArrow
    >
      <div className={styles.container}>
        <img className={styles.image} src={getPreparationGuideImg()} alt="preparation guide" />
        <div className={styles.contentWrapper}>
          <h3 className={styles.title}>{t('driveFilePreparationGuide.title', { provider })}</h3>
          <p className={styles.description}>
            <Trans
              i18nKey="driveFilePreparationGuide.description"
              values={{ email, loginService: LOGIN_SERVICE_TO_WORDING[hintLoginService], provider }}
              components={{ b: <strong className="bold" /> }}
            />
          </p>
        </div>
        <IconButton className={styles.closeButton} icon="cancel" size="large" onClick={handleClose} />
      </div>
    </Popper>
  );
};

export default DriveFilePreparationGuide;
