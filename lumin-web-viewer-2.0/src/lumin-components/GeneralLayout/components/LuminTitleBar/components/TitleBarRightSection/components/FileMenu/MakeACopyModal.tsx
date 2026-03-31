import { Modal } from 'lumin-ui/kiwi-ui';
import React from 'react';

import selectors from 'selectors';

import { useNetworkStatus } from 'hooks/useNetworkStatus';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { TOOLS_NAME } from 'constants/toolsName';

import LuminMakeACopyPopper from './MakeACopy/LuminMakeACopyPopper';

import styles from './MakeACopyModal.module.scss';

type MakeACopyModalProps = {
  open: boolean;
  syncFileTo: string;
  handleClose: () => void;
  onSubmitFileDestination: () => void;
  changeSyncFileDestination: (value: string) => void;
};

const MakeACopyModal = ({
  changeSyncFileDestination,
  syncFileTo,
  onSubmitFileDestination,
  handleClose,
  open,
}: MakeACopyModalProps) => {
  const { isOffline } = useNetworkStatus();
  const { t } = useTranslation();
  const isDisabledCopyToS3 = isOffline;
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const typeOfStorage = currentDocument?.service;

  const handleChangeSyncDestination = (value: string) => {
    changeSyncFileDestination(value);
  };

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      title={t('viewer.makeACopy.title')}
      onConfirm={handlePromptCallback({
        callback: () => onSubmitFileDestination(),
        applyForTool: TOOLS_NAME.REDACTION,
        translator: t,
      })}
      onCancel={handleClose}
      confirmButtonProps={{
        title: t('common.choose'),
      }}
      cancelButtonProps={{
        title: t('action.cancel'),
      }}
    >
      <h4 className={styles.modalDescription}>{t('viewer.makeACopy.subTitle')}</h4>
      <LuminMakeACopyPopper
        disabledLuminStorage={isDisabledCopyToS3}
        syncFileTo={syncFileTo}
        typeOfStorage={typeOfStorage}
        handleChangeSyncDestination={handleChangeSyncDestination}
      />
    </Modal>
  );
};

export default MakeACopyModal;
