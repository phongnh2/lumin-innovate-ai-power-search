import React from 'react';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import FeatureItem from '../FeatureItem';
import UploadPopper from '../UploadPopper';

const UploadPDF = () => {
  const { t } = useTranslation();

  return (
    <UploadPopper width="target">
      <FeatureItem
        key="home-upload-a-pdf"
        icon="upload-lg"
        content={t('topFeaturesSection.uploadPDF')}
        data-cy="home-upload-a-pdf"
        data-lumin-btn-name={ButtonName.HOME_UPLOAD_A_PDF}
      />
    </UploadPopper>
  );
};

export default UploadPDF;
