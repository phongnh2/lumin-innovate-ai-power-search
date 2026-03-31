import { Button, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Link } from 'react-router-dom';

import MobileGraphic from 'assets/reskin/images/mobile-graphic.png';
import AppleStoreButton from 'assets/reskin/lumin-svgs/apple-store-button.svg';
import GooglePlayButtonSvg from 'assets/reskin/lumin-svgs/google-play-button.svg';
import LuminLogoSvg from 'assets/reskin/lumin-svgs/lumin-mobile-logo.svg';

import { useTranslation } from 'hooks';

import { isIOS, isAndroid } from 'helpers/device';

import styles from './MobileScreenComponent.module.scss';

const MobileScreenComponent = ({ installAppUrl }: { installAppUrl: string }) => {
  const { t } = useTranslation();
  const isComputer = !isIOS && !isAndroid;
  return (
    <div className={styles.container}>
      <img className={styles.logo} src={LuminLogoSvg} alt="Lumin Logo" />
      <div className={styles.graphicWrapper}>
        <img className={styles.img} src={MobileGraphic} alt="Mobile Graphic" />
      </div>
      <Link className={styles.openLuminAppBtn} to={installAppUrl}>
        <Button fullWidth size="xl" variant="filled">
          {t('installDeeplinkScreen.openTheLuminApp')}
        </Button>
      </Link>
      <div className={styles.descriptionTextWrapper}>
        <Text type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
          {t('installDeeplinkScreen.title')}
        </Text>
        <Text type="body" size="lg" color="var(--kiwi-colors-surface-on-surface-variant)">
          {t('installDeeplinkScreen.description')}
        </Text>
      </div>
      {(isComputer || isIOS) && (
        <Link to={installAppUrl}>
          <img className={styles.installAppButton} src={AppleStoreButton} alt="Apple Store" />
        </Link>
      )}
      {isAndroid && (
        <Link to={installAppUrl}>
          <img className={styles.installAppButton} src={GooglePlayButtonSvg} alt="Google Play" />
        </Link>
      )}
    </div>
  );
};

export default MobileScreenComponent;
