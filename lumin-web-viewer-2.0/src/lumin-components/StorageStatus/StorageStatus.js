import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import StatusPopper from 'luminComponents/StatusPopper';
import {
  documentStorage as storage,
} from 'constants/documentConstants';
import FileSystemWarning from 'assets/images/FileSystemWarning.svg';
import { LocalStorageKey } from 'constants/localStorageKey';
import { useTranslation } from 'hooks';

function StorageStatus({
  documentStorage,
  isLoadingDocument,
  anchorRef,
  onOpen,
  onClose,
}) {
  const [showPopover, setShowPopover] = useState(false);
  const isSystemFile = documentStorage === storage.system;
  const { t } = useTranslation();

  useEffect(() => {
    const isDisbledSystemStorageWarning = localStorage.getItem(LocalStorageKey.DISABLE_SYSTEM_STORAGE_WARNING);
    if (isSystemFile && !isLoadingDocument && !isDisbledSystemStorageWarning) {
      setShowPopover(true);
      onOpen();
    }
  }, [isLoadingDocument]);

  const closePopover = () => {
    setShowPopover(false);
    onClose();
    localStorage.setItem(LocalStorageKey.DISABLE_SYSTEM_STORAGE_WARNING, true);
  };

  return (
    <StatusPopper
      showPopover={showPopover}
      anchorRef={anchorRef}
      onClose={closePopover}
      placement="bottom-start"
      content={{
        img: FileSystemWarning,
        title: t('viewer.header.filesStorageWillBeChanged'),
        desc: t('viewer.header.messageFileStoredInYourDevice'),
      }}
    />
  );
}

StorageStatus.propTypes = {
  documentStorage: PropTypes.string,
  anchorRef: PropTypes.object,
  isLoadingDocument: PropTypes.bool,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
};

StorageStatus.defaultProps = {
  documentStorage: storage.S3,
  isLoadingDocument: true,
  anchorRef: {},
  onOpen: () => {},
  onClose: () => {},
};

export default StorageStatus;
