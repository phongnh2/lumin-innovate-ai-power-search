import { Menu } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'lumin-components/Icomoon';
import { UploadDropZonePopper } from 'lumin-components/UploadDropZone';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';
import withDropDocPopup from 'HOC/withDropDocPopup';

import { useGetFolderType, useTranslation, useOpenUploadFile } from 'hooks';

import { folderType } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';

import EnhancedUploadButton from './EnhancedUploadButton';

import * as Styled from './UploadButton.styled';

function UploadButton({ onFilesPicked, disabled, folderId }) {
  const { t } = useTranslation();

  const [opened, setOpened] = useState(false);

  const isOffline = useSelector(selectors.isOffline);
  const currentFolderType = useGetFolderType();

  const { openUploadFileDialog } = useOpenUploadFile();

  const handlePickSystemFile = async () => {
    const fileHandles = await systemFileHandler.openFilePicker();
    onFilesPicked(fileHandles, STORAGE_TYPE.SYSTEM);
  };

  useEffect(() => {
    if (openUploadFileDialog) {
      setOpened(true);
    }
  }, [openUploadFileDialog]);

  if (disabled) {
    return null;
  }

  if (currentFolderType === folderType.DEVICE) {
    return (
      <Styled.UploadSystemButton size={ButtonSize.XL} onClick={handlePickSystemFile}>
        <Icomoon className="computer" />
        <Styled.ButtonText>{t('navbar.openFile')}</Styled.ButtonText>
      </Styled.UploadSystemButton>
    );
  }

  return (
    <Menu
      width={194}
      ComponentTarget={<EnhancedUploadButton isOffline={isOffline} uploadText={t('common.upload')} />}
      position="bottom-end"
      closeOnItemClick={false}
      opened={opened}
      onChange={setOpened}
      disabled={isOffline}
      withinPortal={false}
    >
      <UploadDropZonePopper
        folderId={folderId}
        closePopper={() => setOpened(false)}
        onUploadLuminFiles={onFilesPicked}
        isOffline={isOffline}
      />
    </Menu>
  );
}

UploadButton.propTypes = {
  onFilesPicked: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  folderId: PropTypes.string,
};

UploadButton.defaultProps = {
  folderId: null,
};

export default compose(withDropDocPopup.Consumer, React.memo)(UploadButton);
