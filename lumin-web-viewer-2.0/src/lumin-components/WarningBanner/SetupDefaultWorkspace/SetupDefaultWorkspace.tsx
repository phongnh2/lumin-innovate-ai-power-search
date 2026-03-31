import { InfoIcon } from '@luminpdf/icons/dist/csr/Info';
import React from 'react';
import { useNavigate } from 'react-router';

import { useTranslation } from 'hooks';

import { Routers } from 'constants/Routers';

import SemanticTopBanner from '../SemanticTopBanner';

type Props = {
  onClose: () => void;
};

const SetupDefaultWorkspace = ({ onClose }: Props) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const onConfirm = () => {
    navigate(Routers.SETTINGS.GENERAL);
  };

  return (
    <SemanticTopBanner
      type="info"
      leftIcon={<InfoIcon color="var(--kiwi-colors-semantic-information)" weight="fill" size={24} />}
      content={t('banner.setupDefaultWorkspace.mainTitle')}
      confirmButtonTitle={t('banner.setupDefaultWorkspace.setUpNow')}
      onConfirm={onConfirm}
      cancelButtonTitle={t('common.later')}
      onCancel={onClose}
    />
  );
};

export default SetupDefaultWorkspace;
