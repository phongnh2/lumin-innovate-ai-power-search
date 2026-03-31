import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { useSaveToThirdPartyStorageContext } from 'features/SaveToThirdPartyStorage/hooks/useSaveToThirdPartyStorageContext';

import { MultipleMergeStep } from '../../enum';
import { useMultipleMergeContext } from '../../hooks/useMultipleMergeContext';

type Props = {
  onClose: () => void;
};

const MultipleMergeFooter = ({ onClose }: Props) => {
  const { t } = useTranslation();
  const { getAbortController, currentStep, handleClickConfirm, disabledMergeButton, openSaveToDriveModal } =
    useMultipleMergeContext();
  const { errors, isSubmitting } = useSaveToThirdPartyStorageContext();

  const handleClickAction = async () => {
    if (openSaveToDriveModal) {
      return;
    }

    await handleClickConfirm();
  };

  return (
    <>
      <Button
        variant="outlined"
        size="lg"
        onClick={() => {
          getAbortController().abort('User cancel multiple merge');
          onClose();
        }}
      >
        {t('common.cancel')}
      </Button>
      <Button
        disabled={disabledMergeButton || Boolean(Object.keys(errors).length) || isSubmitting}
        onClick={handleClickAction}
        size="lg"
        type={openSaveToDriveModal ? 'submit' : 'button'}
        variant="filled"
        loading={isSubmitting}
      >
        {currentStep === MultipleMergeStep.SAVE_DOCUMENT ? t('action.save') : t('action.merge')}
      </Button>
    </>
  );
};

export default MultipleMergeFooter;
