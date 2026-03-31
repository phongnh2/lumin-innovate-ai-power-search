import { Modal } from 'lumin-ui/kiwi-ui';
import React from 'react';

import AGFillIcon from 'assets/lumin-svgs/ag-fill.svg';

import { useRandomMessage } from 'features/CNC/CncComponents/AgreementGenInputBox/hooks/useRandomMessage';

import styles from './ProcessingModal.module.scss';

export const ProcessingModal = () => {
  const { message } = useRandomMessage();
  return (
    <Modal
      opened
      onClose={() => {}}
      classNames={{
        content: styles.processingModal,
      }}
    >
      <img src={AGFillIcon} alt="AGFillIcon" className={styles.icon} />
      <p className={styles.processingMessage}>{message}</p>
    </Modal>
  );
};
