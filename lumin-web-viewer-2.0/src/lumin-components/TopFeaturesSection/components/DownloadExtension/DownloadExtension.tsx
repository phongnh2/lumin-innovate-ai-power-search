import React from 'react';

import { useTranslation } from 'hooks';

import { useGetPromoteChromeExtensionFlag } from 'features/CNC/hooks/useGetPromoteChromeExtensionFlag';

import { CHROME_EXTENSION_URL } from 'constants/urls';

import FeatureItem from '../FeatureItem';

const DownloadExtension = () => {
  const { t } = useTranslation();

  const { isPromoteChromeExtension } = useGetPromoteChromeExtensionFlag();

  if (!isPromoteChromeExtension) {
    return null;
  }

  const handleDownloadExtension = () => {
    window.open(CHROME_EXTENSION_URL, '_blank').focus();
  };

  return (
    <FeatureItem
      icon="download-lg"
      content={t('topFeaturesSection.downloadExtension')}
      data-cy="home-download-extension"
      onTrigger={handleDownloadExtension}
    />
  );
};

export default DownloadExtension;
