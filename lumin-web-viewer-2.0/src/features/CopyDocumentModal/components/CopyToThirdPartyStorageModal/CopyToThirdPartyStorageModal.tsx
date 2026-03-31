import { Dialog } from 'lumin-ui/kiwi-ui';
import React from 'react';

import SaveToThirdPartyStorageForm from 'features/SaveToThirdPartyStorage/components/SaveToThirdPartyStorageForm';

import UserEventConstants from 'constants/eventConstants';

import CopyToThirdPartyStorageModalContent from './CopyToThirdPartyStorageModalContent';

type CopyToThirdPartyStorageModalProps = {
  action?: string;
  currentDocumentName: string;
  destinationStorage: string;
  downloadType?: string;
  isOpen: boolean;
  onClose?: () => void;
  onConfirm: () => Promise<void>;
};

const CopyToThirdPartyStorageModal = ({
  action,
  downloadType,
  isOpen,
  onClose,
  ...rest
}: CopyToThirdPartyStorageModalProps) => {
  const isDownloadDoc = action === UserEventConstants.Events.HeaderButtonsEvent.DOWNLOAD;

  return (
    <Dialog closeOnClickOutside={false} closeOnEscape={false} opened={isOpen} onClose={onClose}>
      <SaveToThirdPartyStorageForm action={action} downloadType={downloadType} {...rest}>
        <CopyToThirdPartyStorageModalContent isDownloadDoc={isDownloadDoc} onClose={onClose} />
      </SaveToThirdPartyStorageForm>
    </Dialog>
  );
};

CopyToThirdPartyStorageModal.defaultProps = {
  action: UserEventConstants.Events.HeaderButtonsEvent.MAKE_COPY,
  downloadType: 'pdf',
  onClose: () => {},
};

export default CopyToThirdPartyStorageModal;
