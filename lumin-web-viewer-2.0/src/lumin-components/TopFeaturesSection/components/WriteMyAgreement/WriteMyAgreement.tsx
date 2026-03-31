import React from 'react';

import { useTranslation } from 'hooks';

import { getAgreementGenUrl } from 'utils/agreementGen';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { useEnableAITool } from 'features/AgreementGen/hooks';

import FeatureItem from '../FeatureItem';

const WriteMyAgreement = () => {
  const { t } = useTranslation();
  const { enabled: enabledAITool } = useEnableAITool();

  const openAgreementGenPage = () => {
    const url = getAgreementGenUrl('home-write-agreement');
    window.open(url, '_blank').focus();
  };

  if (!enabledAITool) {
    return null;
  }

  return (
    <FeatureItem
      icon="lm-agreement-gen"
      content={t('topFeaturesSection.writeMyAgreement')}
      onTrigger={openAgreementGenPage}
      data-cy="home-write-my-agreement"
      data-lumin-btn-name={ButtonName.HOME_WRITE_MY_AGREEMENT}
    />
  );
};

export default WriteMyAgreement;
