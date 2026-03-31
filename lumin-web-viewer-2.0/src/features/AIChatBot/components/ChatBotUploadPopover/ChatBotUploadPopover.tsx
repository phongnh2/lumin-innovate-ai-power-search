import { PaperclipIcon } from '@luminpdf/icons/dist/csr/Paperclip';
import { useDisclosure } from '@mantine/hooks';
import { Menu, MenuItem, FileButton, IconButton } from 'lumin-ui/kiwi-ui';
import React, { useRef } from 'react';

import { SUPPORTED_FILE_MERGE } from '@new-ui/components/ToolProperties/components/MergePanel/constants';

import GoogleDriveLogo from 'assets/reskin/lumin-svgs/google.svg';

import GoogleFilePicker from 'lumin-components/GoogleFilePicker';
import { ResponseObject } from 'luminComponents/GoogleFilePicker/types';

import { useTranslation } from 'hooks/useTranslation';

import { ATTACHED_FILES_SOURCE, ATTACHED_FILES_STATUS } from 'features/AIChatBot/constants/attachedFiles';
import { AttachedFilesSourceType, AttachedFileStatusType } from 'features/AIChatBot/interface';

import { UPLOAD_FILE_TYPE } from 'constants/customConstant';

interface ChatBotUploadPopoverProps {
  handleAddFiles: (props: {
    files: (File & { remoteId?: string })[];
    source: AttachedFilesSourceType;
    status: AttachedFileStatusType;
  }) => void;
}

const ChatBotUploadPopover: React.FC<ChatBotUploadPopoverProps> = ({ handleAddFiles }) => {
  const [opened, handlers] = useDisclosure(false);
  const resetRef = useRef<() => void>(null);
  const { t } = useTranslation();

  const handleChangeFilesFromDevice = (files: File[]) => {
    if (files && files.length > 0) {
      handleAddFiles({ files, status: ATTACHED_FILES_STATUS.UPLOADING, source: ATTACHED_FILES_SOURCE.LOCAL });
    }
    resetRef.current?.();
    handlers.close();
  };

  const handleGoogleFileChange = (data: ResponseObject) => {
    handlers.close();
    handleAddFiles({
      files: data.docs.map((file) => ({
        remoteId: file.id,
        name: file.name,
        size: file.sizeBytes,
        mimeType: file.mimeType,
      })) as unknown as File[],
      source: ATTACHED_FILES_SOURCE.GOOGLE,
      status: ATTACHED_FILES_STATUS.UPLOADING,
    });
  };

  return (
    <Menu
      position="top-start"
      closeOnItemClick={false}
      onClose={handlers.close}
      opened={opened}
      width="265px"
      ComponentTarget={
        <IconButton
          onClick={handlers.toggle}
          icon={<PaperclipIcon size={16} />}
          variant="text"
          size="sm"
          data-cy="add_file_button"
        />
      }
    >
      <FileButton
        accept={SUPPORTED_FILE_MERGE.join(',')}
        onChange={handleChangeFilesFromDevice}
        multiple
        resetRef={resetRef}
      >
        {(props) => (
          <MenuItem {...props} leftIconProps={{ type: 'device-desktop-lg' }}>
            {t('navbar.fromMyDevice')}
          </MenuItem>
        )}
      </FileButton>

      <GoogleFilePicker
        onClose={handlers.close}
        onPicked={handleGoogleFileChange}
        uploadType={UPLOAD_FILE_TYPE.DOCUMENT}
        multiSelect
        mimeType={SUPPORTED_FILE_MERGE.join(',')}
        isUpload={false}
      >
        <MenuItem component="div" leftSection={<img src={GoogleDriveLogo} alt="Upload from Google Drive" />}>
          {t('viewer.leftPanelEditMode.fromGoogleDrive')}
        </MenuItem>
      </GoogleFilePicker>
    </Menu>
  );
};

export default ChatBotUploadPopover;
