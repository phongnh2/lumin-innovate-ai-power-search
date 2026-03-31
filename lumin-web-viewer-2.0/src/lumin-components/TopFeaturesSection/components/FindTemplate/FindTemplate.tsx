import React from 'react';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { STATIC_PAGE_URL } from 'constants/urls';

import FeatureItem from '../FeatureItem';

const FindTemplate = () => {
  const { t } = useTranslation();

  const handleOpenTemplatePage = () => {
    window.open(`${STATIC_PAGE_URL}/form-templates`, '_blank').focus();
  };

  return (
    <FeatureItem
      icon="logo-template-lg"
      content={t('topFeaturesSection.findTemplate')}
      onTrigger={handleOpenTemplatePage}
      data-cy="home-use-a-template"
      data-lumin-btn-name={ButtonName.HOME_USE_A_TEMPLATE}
    />
  );
};

export default FindTemplate;
