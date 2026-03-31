import classNames from 'classnames';
import { IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { DocumentThumbnail } from 'luminComponents/ReskinLayout/components/DocumentListItem/components';

import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { getFileService } from 'utils';

import { IDocumentBase } from 'interfaces/document/document.interface';

import styles from './DocumentItem.module.scss';

type DocumentItemProps = {
  document: IDocumentBase;
  onSelect: () => void;
  isSelected?: boolean;
};

const DocumentItem = ({ document, onSelect, isSelected }: DocumentItemProps) => {
  const { name, thumbnail } = document;
  const nameWithoutExt = name.substring(0, name.lastIndexOf('.')) || name;

  const { onKeyDown } = useKeyboardAccessibility();

  return (
    <div
      role="button"
      tabIndex={0}
      data-cy="choose_a_file_to_edit_document_item"
      className={classNames(styles.container, { [styles.selected]: isSelected })}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <div className={styles.leftSection}>
        <DocumentThumbnail
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          src={getFileService.getThumbnailUrl(thumbnail)}
          altText={nameWithoutExt}
        />
        <span className={styles.name}>{nameWithoutExt}</span>
      </div>
      <div className={styles.rightSection}>
        <IconButton size="sm" icon="check-sm" />
      </div>
    </div>
  );
};

export default DocumentItem;
