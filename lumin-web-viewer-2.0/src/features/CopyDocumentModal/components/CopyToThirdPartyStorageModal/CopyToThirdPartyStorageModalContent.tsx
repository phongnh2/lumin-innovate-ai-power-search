import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useTranslation } from 'hooks';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { eventTracking } from 'utils/recordUtil';

import SaveToDriveFormContent from 'features/SaveToThirdPartyStorage/components/SaveToThirdPartyStorageFormContent';
import { useSaveToThirdPartyStorageContext } from 'features/SaveToThirdPartyStorage/hooks/useSaveToThirdPartyStorageContext';

import dataElements from 'constants/dataElement';
import UserEventConstants from 'constants/eventConstants';

import styles from './CopyToThirdPartyStorageModal.module.scss';

export type CopyToThirdPartyStorageModalContentProps = {
  onClose?: () => void;
  isDownloadDoc: boolean;
};

const CopyToThirdPartyStorageModalContent = ({
  onClose,
  isDownloadDoc,
}: CopyToThirdPartyStorageModalContentProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { formState } = useSaveToThirdPartyStorageContext();
  const { isSubmitting, isValid } = formState;

  const closeDownloadModal = () => {
    onClose?.();
    dispatch(actions.openElement(dataElements.SAVE_AS_MODAL));
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: ButtonName.CANCEL_SAVE_TO_DRIVE,
      elementPurpose: ButtonPurpose[ButtonName.CANCEL_SAVE_TO_DRIVE],
    }).catch(() => {});
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {t(isDownloadDoc ? 'viewer.downloadModal.saveToDrive' : 'modalMakeACopy.copyDocuments')}
      </div>
      <div>
        <SaveToDriveFormContent />
      </div>
      <div className={styles.footer}>
        <Button
          variant="outlined"
          size="lg"
          onClick={isDownloadDoc ? closeDownloadModal : onClose}
          data-lumin-btn-name={isDownloadDoc ? ButtonName.CANCEL_SAVE_TO_DRIVE : null}
        >
          {t('action.cancel')}
        </Button>
        <Button
          disabled={!isValid}
          size="lg"
          type="submit"
          variant="filled"
          loading={isSubmitting}
          data-lumin-btn-name={isDownloadDoc ? ButtonName.CONFIRM_SAVE_TO_DRIVE : null}
        >
          {t(isDownloadDoc ? 'action.save' : 'action.copy')}
        </Button>
      </div>
    </div>
  );
};

export default CopyToThirdPartyStorageModalContent;
