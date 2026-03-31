import { Button, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { forwardRef, Ref } from 'react';

import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { AWS_EVENTS } from 'constants/awsEvents';

import styles from './EnhancedUploadButton.module.scss';

type EnhancedUploadButtonProps = {
  isOffline: boolean;
  uploadText: string;
};

const EnhancedUploadButton = forwardRef(
  ({ isOffline, uploadText, ...extraProps }: EnhancedUploadButtonProps, ref: Ref<HTMLButtonElement>) => (
    <div role="presentation" tabIndex={-1} className={styles.wrapper}>
      <Button
        ref={ref}
        size="lg"
        classNames={{
          root: styles.rootButton,
        }}
        startIcon={<Icomoon type="upload-lg" size="lg" />}
        disabled={isOffline}
        data-lumin-btn-event-type={AWS_EVENTS.CLICK}
        data-lumin-btn-name={NavigationNames.UPLOAD_DOC}
        {...extraProps}
      >
        {uploadText}
      </Button>
    </div>
  )
);

export default React.memo(EnhancedUploadButton);
