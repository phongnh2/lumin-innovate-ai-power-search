import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';

import IntegrationXOnedriveOldUI from 'assets/images/integration-x-onedrive-her.png';
import IntegrationXOnedriveNewUI from 'assets/reskin/images/integration-x-onedrive-him.png';

import ButtonMaterial, { ButtonSize } from 'luminComponents/ButtonMaterial';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { useAuthorize } from 'features/OneDriveAddInsAuthorization/hooks';

import baseStyles from '../../OneDriveAddInsAuthorization.module.scss';

import styles from './AuthorizationSection.module.scss';

const ONEDRIVE_URL = 'https://onedrive.live.com/';

const AuthorizationSection = () => {
  const { t } = useTranslation();

  const { isEnableReskin } = useEnableWebReskin();

  const handleNavigateToOneDrive = (url: string) => {
    window.location.href = url || ONEDRIVE_URL;
  };

  const { handleAuthorize, isProcessing } = useAuthorize({ onSuccess: handleNavigateToOneDrive });

  const actionText = t('common.authorizeWith', { target: 'Microsoft' });

  return (
    <div className={baseStyles.container} data-reskin={isEnableReskin}>
      <img
        className={styles.img}
        data-reskin={isEnableReskin}
        src={isEnableReskin ? IntegrationXOnedriveNewUI : IntegrationXOnedriveOldUI}
        alt="integration-x-onedrive"
      />
      <div>
        <h2 className={baseStyles.title} data-reskin={isEnableReskin}>
          {t('oneDriveAddInsAuthorization.withAuthorized.title')}
        </h2>
        <p className={baseStyles.content} data-reskin={isEnableReskin}>
          {t('oneDriveAddInsAuthorization.withAuthorized.content')}
        </p>
      </div>
      {isEnableReskin ? (
        <Button variant="filled" size="lg" onClick={handleAuthorize} loading={isProcessing}>
          {actionText}
        </Button>
      ) : (
        <ButtonMaterial size={ButtonSize.XL} onClick={handleAuthorize} loading={isProcessing}>
          {actionText}
        </ButtonMaterial>
      )}
    </div>
  );
};

export default AuthorizationSection;
