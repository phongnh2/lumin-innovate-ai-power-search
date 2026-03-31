import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';

import styles from './OneDriveFilePickerIframe.module.scss';

type OneDriveFilePickerIframeProps = {
  isOpen: boolean;
};

const OneDriveFilePickerIframe = forwardRef(
  ({ isOpen }: OneDriveFilePickerIframeProps, ref: React.MutableRefObject<HTMLIFrameElement | null>) =>
    createPortal(
      <div className={styles.container} data-display={isOpen}>
        {isOpen && <iframe ref={ref} title="OneDrive File Picker" className={styles.iframe} />}
      </div>,
      document.body
    )
);

export default React.memo(OneDriveFilePickerIframe);
