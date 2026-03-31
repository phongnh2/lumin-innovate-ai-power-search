import { Button, ButtonSize, ButtonVariant } from 'lumin-ui/dist/kiwi-ui';
import React from 'react';

import Dialog from 'lumin-components/Dialog';
import Icomoon from 'lumin-components/Icomoon';
import EditorThemeProvider from 'luminComponents/ViewerCommonV2/ThemeProvider';

import { useThemeMode } from 'hooks';

import { ModalSize } from 'constants/styles';

import { IOrganization } from 'interfaces/organization/organization.interface';

import useHandleReactivateModal from './hooks/useHandleReactivateModal';

import styles from './ReactivateModal.module.scss';

const DETAIL_CONTENTS = [
  'Edit PDF text & content',
  'Invite unlimited people',
  'Edit 30 documents',
  'Merge & split documents',
  'Access 100 digital signatures',
  'And much more!',
];

type Props = {
  currentOrganization: IOrganization;
  onClose: () => void;
};

const lightTheme = {
  paper: styles.paper,
  closeButton: styles.closeIcon,
};

const darkTheme = {
  paper: styles.paper,
  closeButton: styles.closeIcon,
};

const ReactivateModal = ({ currentOrganization, onClose }: Props) => {
  const { onClickButton, onCloseModal, loading, getTextButton } = useHandleReactivateModal({
    currentOrganization,
    onClose,
  });
  const themeMode = useThemeMode();
  const classes = themeMode === 'light' ? lightTheme : darkTheme;

  const renderContent = () =>
    DETAIL_CONTENTS.map((content, index) => (
      <div key={index} className={styles.detailItem}>
        <Icomoon className={`checkbox ${styles.icomoon}`} size={24} />
        <p className={styles.detailMessage}>{content}</p>
      </div>
    ));

  return (
    <EditorThemeProvider>
      <Dialog
        width={ModalSize.MDX}
        open
        onClose={onCloseModal}
        hasCloseBtn={!loading}
        disableBackdropClick
        classes={classes}
      >
        <div>
          <p className={styles.title}>Don't Miss Out! Renew Your Subscription</p>
          <p className={styles.description}>
            Rediscover the benefits of your previous plan and continue enjoying our services.
          </p>
          <div className={styles.detailContainer}>{renderContent()}</div>
          <Button
            variant={ButtonVariant.filled}
            size={ButtonSize.lg}
            className={styles.button}
            onClick={onClickButton}
            loading={loading}
            fullWidth
          >
            {getTextButton()}
          </Button>
        </div>
      </Dialog>
    </EditorThemeProvider>
  );
};

export default ReactivateModal;
