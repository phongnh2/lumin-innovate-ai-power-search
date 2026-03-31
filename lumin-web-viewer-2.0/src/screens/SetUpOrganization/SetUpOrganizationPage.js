import React from 'react';
import SetUpOrganization from 'lumin-components/SetUpOrganization';
import { useTranslation } from 'hooks';

const SetUpOrganizationPage = () => {
  const { t } = useTranslation();
  return <SetUpOrganization title={t('setUpOrg.titleSetUpOrg')} />;
};

export default SetUpOrganizationPage;
