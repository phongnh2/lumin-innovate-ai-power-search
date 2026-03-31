import { Icomoon, IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { IFolder } from 'interfaces/folder/folder.interface';

import styles from './FolderItem.module.scss';

type FolderItemProps = {
  folder: IFolder;
  onSelect: () => void;
};

const FolderItem = ({ folder, onSelect }: FolderItemProps) => {
  const { name } = folder;
  const { onKeyDown } = useKeyboardAccessibility();

  return (
    <div
      role="button"
      tabIndex={0}
      data-cy="choose_a_file_to_edit_folder_item"
      className={styles.container}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <div className={styles.leftSection}>
        <Icomoon type="folder-lg" size="lg" color="var(--kiwi-colors-surface-on-surface)" />
        <span className={styles.name}>{name}</span>
      </div>
      <div className={styles.rightSection}>
        <IconButton size="sm" icon="chevron-right-sm" />
      </div>
    </div>
  );
};
export default FolderItem;
