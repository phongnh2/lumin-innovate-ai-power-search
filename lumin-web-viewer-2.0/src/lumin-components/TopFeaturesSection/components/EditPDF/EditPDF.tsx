import React, { useState } from 'react';

import { useGetCurrentOrganization, useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import ChooseFile from 'features/ChooseFile';

import { folderType } from 'constants/documentConstants';

import FeatureItem from '../FeatureItem';
import UploadPopper from '../UploadPopper';

const EditPDF = () => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const currentOrg = useGetCurrentOrganization();

  const handleOpenHomeEditAPdfFlowModal = () => {
    if (!currentOrg.documentsAvailable) {
      return;
    }
    setOpened(true);
  };

  return (
    <>
      <UploadPopper
        title={t('topFeaturesSection.popperEditingTitle')}
        disabled={Boolean(currentOrg.documentsAvailable)}
        isOnHomeEditAPdfFlow
        folderType={folderType.INDIVIDUAL}
        targetId={currentOrg._id}
        canAutoOpen={false}
        width="target"
      >
        <FeatureItem
          activated={opened}
          icon="edit-pdf-lg"
          content={t('topFeaturesSection.editPDF')}
          data-cy="home-edit-a-pdf"
          data-lumin-btn-name={ButtonName.HOME_EDIT_A_PDF}
          onTrigger={handleOpenHomeEditAPdfFlowModal}
        />
      </UploadPopper>
      {opened && <ChooseFile setOpened={setOpened} />}
    </>
  );
};

export default EditPDF;
