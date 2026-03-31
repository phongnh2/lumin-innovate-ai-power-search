import React from 'react';

import Dialog from 'luminComponents/Dialog';
import FailedToAccessDocument from 'luminComponents/FailedToAccessDocument';

import { ModalSize } from 'constants/styles';

import styles from './FailedToAccessDialog.module.scss';

export default function FailedToAccessDialog() {
  return (
    <Dialog open disableBackdropClick width={ModalSize.XL}>
      <div className={styles.wrapper}>
        <FailedToAccessDocument />
      </div>
    </Dialog>
  );
}
