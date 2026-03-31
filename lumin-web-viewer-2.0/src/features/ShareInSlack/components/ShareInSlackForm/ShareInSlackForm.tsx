import { Button, Collapse, Modal } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { useTranslation } from 'hooks';

import useHandleShareInSlack from 'features/ShareInSlack/hooks/useHandleShareInSlack';
import { shareInSlackSelectors } from 'features/ShareInSlack/reducer/ShareInSlack.reducer';

import AccessLevelSelect from './AccessLevelSelect';
import AddMessage from './AddMessage';
import DestinationSelect from './DestinationSelect';
import SharingModeSelect from './SharingModeSelect';
import WorkspaceSelect from './WorkspaceSelect';

import styles from './ShareInSlackForm.module.scss';

const ShareInSlackForm = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const { selectedDestination } = useSelector(shareInSlackSelectors.getFormData);
  const [openedPermissionModal, setOpenedPermissionModal] = useState(false);

  const { handleShare, isLoading, handleConfirmPermissionModal, handleDismissPermissionModal } = useHandleShareInSlack({
    message,
    onClose,
    setOpenedPermissionModal,
  });

  return (
    <div className={styles.container}>
      <WorkspaceSelect />
      <DestinationSelect />
      <Collapse in={!!selectedDestination}>
        <div className={styles.container}>
          <SharingModeSelect />
          <AccessLevelSelect />
          <AddMessage message={message} setMessage={setMessage} />
        </div>
      </Collapse>
      <div className={styles.shareButtonContainer}>
        <Button
          className={styles.shareButton}
          size="lg"
          disabled={!selectedDestination}
          onClick={handleShare}
          loading={isLoading}
        >
          {t('common.share')}
        </Button>
      </div>
      {openedPermissionModal && (
        <Modal
          opened
          onClose={() => setOpenedPermissionModal(false)}
          title={t('shareInSlack.overwriteOrKeepThePermissions')}
          message={
            selectedDestination.isChannel
              ? t('shareInSlack.someUsersAlreadyHaveDocumentPermissions')
              : t('shareInSlack.thisUserAlreadyHasDocumentPermission')
          }
          onCancel={handleDismissPermissionModal}
          onConfirm={handleConfirmPermissionModal}
          confirmButtonProps={{ title: t('shareInSlack.keepTheCurrent') }}
          cancelButtonProps={{ title: t('shareInSlack.overwritePermissions') }}
        />
      )}
    </div>
  );
};

export default ShareInSlackForm;
