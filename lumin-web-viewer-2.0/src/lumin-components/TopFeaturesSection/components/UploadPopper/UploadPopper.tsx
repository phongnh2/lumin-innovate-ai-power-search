import { Menu, Text, PopoverProps } from 'lumin-ui/kiwi-ui';
import React, { useState, useMemo, useEffect, useId, useCallback } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useHomeContext } from 'screens/Home/hooks';

import { UploadDropZonePopper } from 'lumin-components/UploadDropZone';
import { OneDriveFilePickerProvider } from 'luminComponents/OneDriveFilePicker';
import { useHomeEditAPdfFlowHandler } from 'luminComponents/TopFeaturesSection/hooks';
import { useTopFeaturesSectionContext } from 'luminComponents/TopFeaturesSection/hooks/useTopFeaturesSectionContext';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useOpenUploadFile } from 'hooks';

import styles from './UploadPopper.module.scss';

type UploadedFileExtraPayload = {
  isOnHomeEditAPdfFlow?: boolean;
  folderType?: string;
  targetId?: string;
  canAutoOpen?: boolean;
};

type UploadPopperProps = {
  children: React.ReactNode;
  title?: string;
  folderId?: string;
  disabled?: boolean;
  width?: PopoverProps['width'];
  onFilesPicked: (files: File[], uploadFrom?: string) => void;
  afterPickFileCallback?: () => void;
  uploadButtonWrapperClassName?: string;
} & UploadedFileExtraPayload;

const UploadPopper = ({
  children,
  title,
  folderId,
  disabled = false,
  width = 'max-content',
  isOnHomeEditAPdfFlow = false,
  onFilesPicked,
  folderType,
  targetId,
  afterPickFileCallback,
  uploadButtonWrapperClassName,
  canAutoOpen = true,
}: UploadPopperProps) => {
  const [opened, setOpened] = useState(false);
  const popperId = useId();
  const context = useTopFeaturesSectionContext();
  const { openUploadFileDialog } = useOpenUploadFile();

  const isOffline = useSelector(selectors.isOffline);

  const { handleVerifyBeforeUploadingFlow } = useHomeEditAPdfFlowHandler({ isOnHomeEditAPdfFlow });

  const onClosePopper = useCallback(() => setOpened(false), []);

  useEffect(() => {
    context.registerPopper(popperId, onClosePopper);
    return () => {
      context.unregisterPopper(popperId);
    };
  }, [popperId, context]);

  useEffect(() => {
    if (openUploadFileDialog && canAutoOpen) {
      setOpened(true);
    }
  }, [openUploadFileDialog]);

  const componentTarget = useMemo(
    () => (
      <div className={uploadButtonWrapperClassName}>
        {React.cloneElement(children as React.ReactElement, { activated: opened })}
      </div>
    ),
    [opened, children, uploadButtonWrapperClassName]
  );

  const { scrollRef } = useHomeContext();

  if (disabled) {
    return children;
  }

  const handleUpload = (files: (File & { extraPayload?: UploadedFileExtraPayload })[], uploadFrom?: string) => {
    const { allowedUpload, errorHandler } = handleVerifyBeforeUploadingFlow(files);
    if (!allowedUpload) {
      errorHandler();
      return;
    }
    files[0].extraPayload = {
      isOnHomeEditAPdfFlow,
      folderType,
      targetId,
    };
    onFilesPicked(files, uploadFrom);
    afterPickFileCallback?.();
  };

  return (
    <OneDriveFilePickerProvider>
      <Menu
        ComponentTarget={componentTarget}
        position="bottom-start"
        closeOnItemClick={false}
        opened={opened}
        onChange={setOpened}
        disabled={isOffline}
        width={width}
        closeOnScroll={{
          elementRef: {
            current: scrollRef,
          },
        }}
      >
        <div>
          {title && (
            <Text className={styles.title} size="xs" type="headline" color="var(--kiwi-colors-surface-on-surface)">
              {title}
            </Text>
          )}
          <UploadDropZonePopper
            folderId={folderId}
            folderType={folderType}
            closePopper={onClosePopper}
            onUploadLuminFiles={handleUpload}
            isOffline={isOffline}
            isOnHomeEditAPdfFlow={isOnHomeEditAPdfFlow}
          />
        </div>
      </Menu>
    </OneDriveFilePickerProvider>
  );
};

export default withDropDocPopup.Consumer(UploadPopper);
