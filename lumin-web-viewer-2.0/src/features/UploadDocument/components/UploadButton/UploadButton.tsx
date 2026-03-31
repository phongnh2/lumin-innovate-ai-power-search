import { Button, Menu } from 'lumin-ui/kiwi-ui';
import React, { useRef, useState } from 'react';
import { compose } from 'redux';

import selectors from 'selectors';

import { UploadDropZonePopper } from 'lumin-components/UploadDropZone';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

interface UploadButtonProps {
  onFilesPicked?: (files: File[], uploadFrom?: string) => Promise<void>;
  folderId?: string;
}

const UploadButton = ({ onFilesPicked, folderId }: UploadButtonProps) => {
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const [isUploadPopperOpen, setIsUploadPopperOpen] = useState(false);
  const isOffline = useShallowSelector(selectors.isOffline);
  const { t } = useTranslation();

  return (
    <Menu
      opened={isUploadPopperOpen}
      onChange={setIsUploadPopperOpen}
      position="bottom"
      withinPortal={false}
      width="target"
      disabled={isOffline}
      closeOnItemClick={false}
      ComponentTarget={
        <Button
          ref={uploadButtonRef}
          variant="outlined"
          size="md"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            setIsUploadPopperOpen((prev) => !prev);
          }}
          data-cy="document_history_upload_button"
        >
          {t('common.upload')}
        </Button>
      }
    >
      <UploadDropZonePopper
        closePopper={() => setIsUploadPopperOpen(false)}
        onUploadLuminFiles={onFilesPicked}
        folderId={folderId}
        isOffline={isOffline}
      />
    </Menu>
  );
};

export default compose(withDropDocPopup.Consumer, React.memo)(UploadButton);
