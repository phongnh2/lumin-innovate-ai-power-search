import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router';

import IntegrationXOnedriveOldUI from 'assets/images/integration-x-onedrive-him.png';
import IntegrationXOnedriveNewUI from 'assets/reskin/images/integration-x-onedrive-her.png';

import ButtonMaterial, { ButtonSize } from 'luminComponents/ButtonMaterial';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { Routers } from 'constants/Routers';

import baseStyles from '../../OneDriveAddInsAuthorization.module.scss';

import styles from './NonWhitelistedSection.module.scss';

const NonWhitelistedSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const actionText = t('noPermissionOrganization.backBtn');

  const handleBackToDocuments = () => {
    navigate(Routers.ROOT, { replace: true });
  };

  return (
    <div className={baseStyles.container} data-reskin={isEnableReskin} data-nonwhitelisted="true">
      <img
        className={styles.img}
        data-reskin={isEnableReskin}
        src={isEnableReskin ? IntegrationXOnedriveNewUI : IntegrationXOnedriveOldUI}
        alt="integration-x-onedrive"
      />
      <div>
        <h2 className={baseStyles.title} data-reskin={isEnableReskin}>
          {t('oneDriveAddInsAuthorization.withoutAuthorized.title')}
        </h2>
        <p className={baseStyles.content} data-reskin={isEnableReskin}>
          <Trans i18nKey="oneDriveAddInsAuthorization.withoutAuthorized.content" components={{ br: <br /> }} />
        </p>
      </div>
      {isEnableReskin ? (
        <Button variant="filled" size="lg" onClick={handleBackToDocuments}>
          {t('noPermissionOrganization.backBtn')}
        </Button>
      ) : (
        <ButtonMaterial size={ButtonSize.XL} onClick={handleBackToDocuments}>
          {actionText}
        </ButtonMaterial>
      )}
    </div>
  );
};

export default NonWhitelistedSection;
