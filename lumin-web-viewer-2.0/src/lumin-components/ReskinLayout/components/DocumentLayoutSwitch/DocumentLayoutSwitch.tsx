import classNames from 'classnames';
import { PlainTooltip, IconButton, Divider, Menu, MenuItem } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import { OneDriveFilePickerProvider } from 'luminComponents/OneDriveFilePicker';
import UploadButton from 'luminComponents/UploadButton';

import { useTranslation, useGetFolderPermissions } from 'hooks';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { layoutType } from 'constants/documentConstants';

import { IFolder } from 'interfaces/folder/folder.interface';

import { CreateFolderButton } from '../CreateFolderButton';

import styles from './DocumentLayoutSwitch.module.scss';

const LAYOUT_ICON = {
  [layoutType.list]: 'list-lg',
  [layoutType.grid]: 'layout-grid-lg',
};

type DocumentLayoutSwitchProps = {
  layout: string;
  onLayoutChange: (v: string) => void;
  isSearching: boolean;
  folder?: IFolder;
};

const DocumentLayoutSwitch = ({ layout, onLayoutChange, folder, isSearching }: DocumentLayoutSwitchProps) => {
  const { t } = useTranslation();
  const { creatable } = useGetFolderPermissions();
  const { isVisible } = useChatbotStore();

  const [switchLayoutOpened, setSwitchLayoutOpened] = useState(false);

  return (
    <div className={classNames(styles.container, { [styles.chatbotOpened]: isVisible })}>
      {!isSearching && (
        <>
          <OneDriveFilePickerProvider>
            <UploadButton folder={folder} />
          </OneDriveFilePickerProvider>
          <Divider className={styles.divider} orientation="vertical" />
        </>
      )}
      {!isSearching && creatable && (
        <>
          <CreateFolderButton />
          <Divider className={styles.divider} orientation="vertical" />
        </>
      )}
      <Menu
        opened={switchLayoutOpened}
        ComponentTarget={
          <PlainTooltip position="bottom-end" content={t('documentPage.changeYourView')} disabled={switchLayoutOpened}>
            <IconButton size="lg" icon={LAYOUT_ICON[layout] || 'list-lg'} activated={switchLayoutOpened} />
          </PlainTooltip>
        }
        onChange={setSwitchLayoutOpened}
        position="bottom-end"
      >
        <MenuItem leftIconProps={{ type: 'list-md' }} onClick={() => onLayoutChange(layoutType.list)}>
          {t('documentPage.viewAsList')}
        </MenuItem>
        <MenuItem leftIconProps={{ type: 'layout-grid-md' }} onClick={() => onLayoutChange(layoutType.grid)}>
          {t('documentPage.viewAsGrid')}
        </MenuItem>
      </Menu>
    </div>
  );
};

export default DocumentLayoutSwitch;
