import React from 'react';

import { useGetCurrentOrganization, useTranslation } from 'hooks';
import useCreateTeam from 'hooks/useCreateTeam';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import FeatureItem from '../FeatureItem';

const CreateTeamModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/CreateTeamModal'));

const MakeNewTeam = () => {
  const { t } = useTranslation();
  const currentOrg = useGetCurrentOrganization();

  const { onClose, onCreate, openCreateTeamModal, onCreateTeamClick } = useCreateTeam(currentOrg);

  return (
    <>
      <FeatureItem
        icon="users-lg"
        content={t('topFeaturesSection.makeNewTeam')}
        onTrigger={onCreateTeamClick}
        activated={openCreateTeamModal}
        data-cy="home-make-a-space"
        data-lumin-btn-name={ButtonName.HOME_MAKE_A_SPACE}
      />
      {openCreateTeamModal && <CreateTeamModal open onClose={onClose} onCreate={onCreate} />}
    </>
  );
};

export default MakeNewTeam;
