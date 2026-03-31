import classNames from 'classnames';
import { Button, Icomoon, TextType, TextSize, ButtonVariant, Text } from 'lumin-ui/kiwi-ui';
import React, { useRef } from 'react';

import DropboxLogo from 'assets/reskin/lumin-svgs/dropbox.svg';
import GoogleDriveLogo from 'assets/reskin/lumin-svgs/google.svg';
import OneDriveLogo from 'assets/reskin/lumin-svgs/onedrive.svg';

import DropboxFileChooser from 'luminComponents/DropboxFileChooser';
import GoogleFilePicker from 'luminComponents/GoogleFilePicker';
import OneDriveFilePicker, { OneDriveFilePickerProvider } from 'luminComponents/OneDriveFilePicker';

import { useTranslation } from 'hooks';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { DocumentStorage } from 'constants/documentConstants';
import { acceptedMimeType } from 'constants/documentType';

import styles from './EmptyUploadSourceButtons.module.scss';

interface EmptyUploadSourceButtonsProps {
  onFilesPicked: (files: File[], uploadFrom?: string) => void;
  disableUpload: boolean;
  uploadOptions: Record<string, boolean>;
  folderId?: string;
}

function EmptyUploadSourceButtons({ onFilesPicked, disableUpload, uploadOptions, folderId }: EmptyUploadSourceButtonsProps) {
  const { t } = useTranslation();
  const { isVisible: chatbotOpened } = useChatbotStore();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handlePickUpFile = () => {
    if (!disableUpload) {
      inputFileRef.current.click();
    }
  };

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = Array.from(e.target.files);
    onFilesPicked(uploadFiles);
    e.target.value = null;
  };

  return (
    <div className={styles.uploadFromSection} data-chatbot-opened={chatbotOpened}>
      <input
        type="file"
        className={styles.uploadFromMyDeviceInput}
        ref={inputFileRef}
        onChange={handleChangeFile}
        accept={acceptedMimeType.join(',')}
        multiple
      />
      <Text type={TextType.body} size={TextSize.lg} className={styles.uploadFromDescription}>
        {t('documentPage.reskin.uploadDocument.selectSource')}
      </Text>
      <div className={styles.uploadFromGroupButtons}>
        {uploadOptions[DocumentStorage.S3] && (
          <div
            className={classNames(styles.uploadFromButtonWrapper, {
              [styles.disbaledUploadFromButtonWrapper]: disableUpload,
            })}
          >
            <Button
              classNames={{
                root: styles.uploadFromButton,
              }}
              variant={ButtonVariant.elevated}
              size="lg"
              startIcon={<Icomoon type="device-imac-lg" size="lg" />}
              onClick={handlePickUpFile}
              disabled={disableUpload}
            >
              {t('documentPage.reskin.uploadDocument.myDeviceSource')}
            </Button>
          </div>
        )}
        {uploadOptions[DocumentStorage.GOOGLE] && (
          <div
            className={classNames(styles.uploadFromButtonWrapper, {
              [styles.disbaledUploadFromButtonWrapper]: disableUpload,
            })}
          >
            <GoogleFilePicker
              uploadFiles={onFilesPicked}
              folderId={folderId}
              mimeType={acceptedMimeType.join(',')}
              multiSelect
            >
              <Button
                classNames={{
                  root: styles.uploadFromButton,
                }}
                variant={ButtonVariant.elevated}
                size="lg"
                startIcon={<img src={GoogleDriveLogo} alt="upload from Google Drive" />}
                disabled={disableUpload}
              >
                Google Drive
              </Button>
            </GoogleFilePicker>
          </div>
        )}
        {uploadOptions[DocumentStorage.ONEDRIVE] && (
          <div
            className={classNames(styles.uploadFromButtonWrapper, {
              [styles.disbaledUploadFromButtonWrapper]: disableUpload,
            })}
          >
            <OneDriveFilePickerProvider>
              <OneDriveFilePicker uploadFiles={onFilesPicked} folderId={folderId} onClose={() => {}}>
                <Button
                  classNames={{
                    root: styles.uploadFromButton,
                  }}
                  variant={ButtonVariant.elevated}
                  size="lg"
                  startIcon={<img src={OneDriveLogo} alt="upload from OneDrive" />}
                  disabled={disableUpload}
                >
                  OneDrive
                </Button>
              </OneDriveFilePicker>
            </OneDriveFilePickerProvider>
          </div>
        )}
        {uploadOptions[DocumentStorage.DROPBOX] && (
          <div
            className={classNames(styles.uploadFromButtonWrapper, {
              [styles.disbaledUploadFromButtonWrapper]: disableUpload,
            })}
          >
            <DropboxFileChooser uploadFiles={onFilesPicked} folderId={folderId} multiSelect>
              <Button
                classNames={{
                  root: styles.uploadFromButton,
                }}
                variant={ButtonVariant.elevated}
                size="lg"
                startIcon={<img src={DropboxLogo} alt="upload from Dropbox" />}
                disabled={disableUpload}
              >
                Dropbox
              </Button>
            </DropboxFileChooser>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmptyUploadSourceButtons;
